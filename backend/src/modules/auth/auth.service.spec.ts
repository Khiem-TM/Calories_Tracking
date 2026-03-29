import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { User } from '../users/entities/user.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { EmailVerification } from './entities/email-verification.entity';
import { PasswordReset } from './entities/password-reset.entity';

jest.mock('bcrypt');

const mockUser = {
  id: 'user-uuid',
  email: 'test@example.com',
  password_hash: 'hashed_password',
  display_name: 'Test User',
  role: 'user',
  is_active: true,
  is_verified: false,
};

const makeRepo = (overrides = {}) => ({
  findOne: jest.fn(),
  find: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
  delete: jest.fn(),
  update: jest.fn(),
  count: jest.fn(),
  ...overrides,
});

describe('AuthService', () => {
  let service: AuthService;
  let userRepo: ReturnType<typeof makeRepo>;
  let refreshRepo: ReturnType<typeof makeRepo>;
  let emailVerRepo: ReturnType<typeof makeRepo>;
  let passwordResetRepo: ReturnType<typeof makeRepo>;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(async () => {
    userRepo = makeRepo();
    refreshRepo = makeRepo();
    emailVerRepo = makeRepo();
    passwordResetRepo = makeRepo();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: userRepo },
        { provide: getRepositoryToken(RefreshToken), useValue: refreshRepo },
        { provide: getRepositoryToken(EmailVerification), useValue: emailVerRepo },
        { provide: getRepositoryToken(PasswordReset), useValue: passwordResetRepo },
        {
          provide: JwtService,
          useValue: { sign: jest.fn().mockReturnValue('mock_token'), verify: jest.fn() },
        },
      ],
    }).compile();

    service = module.get(AuthService);
    jwtService = module.get(JwtService) as jest.Mocked<JwtService>;
  });

  afterEach(() => jest.clearAllMocks());

  // ─── Register ───────────────────────────────────────────────────────────

  describe('register', () => {
    it('should register a new user and return tokens', async () => {
      userRepo.findOne.mockResolvedValue(null);
      userRepo.create.mockReturnValue(mockUser);
      userRepo.save.mockResolvedValue(mockUser);
      refreshRepo.save.mockResolvedValue({});
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');

      const result = await service.register({
        email: 'test@example.com',
        password: 'password123',
        display_name: 'Test User',
      });

      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('refresh_token');
      expect(result.user.email).toBe('test@example.com');
    });

    it('should throw if email already exists', async () => {
      userRepo.findOne.mockResolvedValue(mockUser);

      await expect(
        service.register({ email: 'test@example.com', password: '123456', display_name: 'X' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ─── Login ──────────────────────────────────────────────────────────────

  describe('login', () => {
    it('should return tokens on valid credentials', async () => {
      userRepo.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      refreshRepo.save.mockResolvedValue({});

      const result = await service.login({ email: 'test@example.com', password: 'password123' });

      expect(result).toHaveProperty('access_token');
      expect(result.user.id).toBe('user-uuid');
    });

    it('should throw if user not found', async () => {
      userRepo.findOne.mockResolvedValue(null);

      await expect(
        service.login({ email: 'no@example.com', password: '123456' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw if password is wrong', async () => {
      userRepo.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login({ email: 'test@example.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw if account is inactive', async () => {
      userRepo.findOne.mockResolvedValue({ ...mockUser, is_active: false });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await expect(
        service.login({ email: 'test@example.com', password: 'password123' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  // ─── RefreshToken ────────────────────────────────────────────────────────

  describe('refreshToken', () => {
    it('should return new access_token for valid refresh token', async () => {
      jwtService.verify.mockReturnValue({ sub: 'user-uuid' });
      userRepo.findOne.mockResolvedValue(mockUser);
      const futureDate = new Date(Date.now() + 1000 * 60 * 60);
      refreshRepo.find.mockResolvedValue([{ token_hash: 'hash', expires_at: futureDate }]);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.refreshToken('valid_refresh_token');
      expect(result).toHaveProperty('access_token');
    });

    it('should throw if refresh token is expired in DB', async () => {
      jwtService.verify.mockReturnValue({ sub: 'user-uuid' });
      userRepo.findOne.mockResolvedValue(mockUser);
      const pastDate = new Date(Date.now() - 1000);
      refreshRepo.find.mockResolvedValue([{ token_hash: 'hash', expires_at: pastDate }]);

      await expect(service.refreshToken('expired_token')).rejects.toThrow(UnauthorizedException);
    });

    it('should throw if no matching hash found', async () => {
      jwtService.verify.mockReturnValue({ sub: 'user-uuid' });
      userRepo.findOne.mockResolvedValue(mockUser);
      const futureDate = new Date(Date.now() + 1000 * 60 * 60);
      refreshRepo.find.mockResolvedValue([{ token_hash: 'hash', expires_at: futureDate }]);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.refreshToken('bad_token')).rejects.toThrow(UnauthorizedException);
    });
  });

  // ─── Logout ──────────────────────────────────────────────────────────────

  describe('logout', () => {
    it('should delete all refresh tokens for user', async () => {
      refreshRepo.delete.mockResolvedValue({ affected: 1 });
      await service.logout('user-uuid');
      expect(refreshRepo.delete).toHaveBeenCalledWith({ user_id: 'user-uuid' });
    });
  });

  // ─── Email Verification ──────────────────────────────────────────────────

  describe('sendEmailVerification', () => {
    it('should create verification token and return message', async () => {
      userRepo.findOne.mockResolvedValue({ ...mockUser, is_verified: false });
      emailVerRepo.delete.mockResolvedValue({});
      emailVerRepo.save.mockResolvedValue({});

      const result = await service.sendEmailVerification('user-uuid');
      expect(result.message).toContain('sent');
    });

    it('should throw if user not found', async () => {
      userRepo.findOne.mockResolvedValue(null);
      await expect(service.sendEmailVerification('bad-id')).rejects.toThrow();
    });

    it('should throw if already verified', async () => {
      userRepo.findOne.mockResolvedValue({ ...mockUser, is_verified: true });
      await expect(service.sendEmailVerification('user-uuid')).rejects.toThrow(BadRequestException);
    });
  });

  describe('verifyEmail', () => {
    it('should verify user email', async () => {
      const future = new Date(Date.now() + 1000 * 60 * 60);
      emailVerRepo.findOne.mockResolvedValue({
        id: 'ver-id',
        userId: 'user-uuid',
        token: 'tok',
        expiresAt: future,
        usedAt: null,
      });
      userRepo.update.mockResolvedValue({});
      emailVerRepo.update.mockResolvedValue({});

      const result = await service.verifyEmail('tok');
      expect(result.message).toContain('verified');
    });

    it('should throw if token not found', async () => {
      emailVerRepo.findOne.mockResolvedValue(null);
      await expect(service.verifyEmail('bad_token')).rejects.toThrow(BadRequestException);
    });

    it('should throw if token expired', async () => {
      const past = new Date(Date.now() - 1000);
      emailVerRepo.findOne.mockResolvedValue({ expiresAt: past, usedAt: null });
      await expect(service.verifyEmail('tok')).rejects.toThrow(BadRequestException);
    });

    it('should throw if token already used', async () => {
      const future = new Date(Date.now() + 1000 * 60 * 60);
      emailVerRepo.findOne.mockResolvedValue({ expiresAt: future, usedAt: new Date() });
      await expect(service.verifyEmail('tok')).rejects.toThrow(BadRequestException);
    });
  });

  // ─── Password Reset ──────────────────────────────────────────────────────

  describe('forgotPassword', () => {
    it('should return same message whether user exists or not', async () => {
      userRepo.findOne.mockResolvedValue(null);
      const result = await service.forgotPassword('no@email.com');
      expect(result.message).toContain('sent');

      userRepo.findOne.mockResolvedValue(mockUser);
      passwordResetRepo.delete.mockResolvedValue({});
      passwordResetRepo.save.mockResolvedValue({});
      const result2 = await service.forgotPassword('test@example.com');
      expect(result2.message).toBe(result.message);
    });
  });

  describe('resetPassword', () => {
    it('should reset password and revoke refresh tokens', async () => {
      const future = new Date(Date.now() + 1000 * 60 * 60);
      passwordResetRepo.findOne.mockResolvedValue({
        id: 'pr-id',
        userId: 'user-uuid',
        token: 'tok',
        expiresAt: future,
        usedAt: null,
      });
      (bcrypt.hash as jest.Mock).mockResolvedValue('new_hash');
      userRepo.update.mockResolvedValue({});
      passwordResetRepo.update.mockResolvedValue({});
      refreshRepo.delete.mockResolvedValue({});

      const result = await service.resetPassword('tok', 'newpassword123');
      expect(result.message).toContain('successfully');
      expect(refreshRepo.delete).toHaveBeenCalledWith({ user_id: 'user-uuid' });
    });

    it('should throw for invalid token', async () => {
      passwordResetRepo.findOne.mockResolvedValue(null);
      await expect(service.resetPassword('bad', 'pass')).rejects.toThrow(BadRequestException);
    });
  });
});
