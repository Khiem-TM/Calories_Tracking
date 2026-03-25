import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const { email, password, display_name } = registerDto;

    // Kiểm tra email đã tồn tại
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      throw new BadRequestException('Email already registered');
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Tạo user
    const user = this.userRepository.create({
      email,
      password_hash,
      display_name,
      is_verified: false,
    });

    await this.userRepository.save(user);

    // Tạo tokens
    return this.generateAuthResponse(user);
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = loginDto;

    // Tìm user
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Kiểm tra password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Kiểm tra account active
    if (!user.is_active) {
      throw new UnauthorizedException('Account is inactive');
    }

    // Tạo tokens
    return this.generateAuthResponse(user);
  }

  async refreshToken(token: string): Promise<{ access_token: string }> {
    try {
      // Verify refresh token
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_REFRESH_SECRET || 'khiemhehe',
      });

      // Tìm user
      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
      });

      if (!user || !user.is_active) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Đối chiếu refresh token với database
      const refreshTokens = await this.refreshTokenRepository.find({
        where: { user_id: user.id },
      });

      let isValidToken = false;
      for (const record of refreshTokens) {
        if (record.expires_at < new Date()) continue;
        if (await bcrypt.compare(token, record.token_hash)) {
          isValidToken = true;
          break;
        }
      }

      if (!isValidToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Tạo access token mới
      const access_token = this.jwtService.sign(
        {
          sub: user.id,
          email: user.email,
          role: user.role,
        },
        {
          secret: process.env.JWT_SECRET || 'khiemhehe',
          expiresIn: '15m',
        },
      );

      return { access_token };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: string): Promise<void> {
    await this.refreshTokenRepository.delete({ user_id: userId });
  }

  private async generateAuthResponse(user: User): Promise<AuthResponseDto> {
    // Tạo access token (15 phút)
    const access_token = this.jwtService.sign(
      {
        sub: user.id,
        email: user.email,
        role: user.role,
      },
      {
        secret: process.env.JWT_SECRET || 'khiemhehe',
        expiresIn: '15m',
      },
    );

    // Tạo refresh token (30 ngày)
    const refresh_token = this.jwtService.sign(
      {
        sub: user.id,
      },
      {
        secret: process.env.JWT_REFRESH_SECRET || 'khiemhehe',
        expiresIn: '30d',
      },
    );

    // Hash refresh token trước khi lưu DB
    const token_hash = await bcrypt.hash(refresh_token, 10);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await this.refreshTokenRepository.save({
      user_id: user.id,
      token_hash,
      expires_at: expiresAt,
    });

    return {
      access_token,
      refresh_token,
      user: {
        id: user.id,
        email: user.email,
        display_name: user.display_name,
        role: user.role,
      },
    };
  }
}
