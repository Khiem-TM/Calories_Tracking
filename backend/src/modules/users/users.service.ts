import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
    });
  }

  async updateProfile(
    id: string,
    updateData: {
      display_name?: string;
      avatar_url?: string;
    },
  ): Promise<User> {
    const user = await this.findById(id);

    if (updateData.display_name) {
      user.display_name = updateData.display_name;
    }

    if (updateData.avatar_url !== undefined) {
      user.avatar_url = updateData.avatar_url;
    }

    await this.userRepository.save(user);
    return user;
  }

  async verifyEmail(id: string): Promise<User> {
    const user = await this.findById(id);
    user.is_verified = true;
    return this.userRepository.save(user);
  }

  async deactivateAccount(id: string): Promise<void> {
    const user = await this.findById(id);
    user.is_active = false;
    await this.userRepository.save(user);
  }

  async getAllUsers(
    limit = 10,
    offset = 0,
  ): Promise<{ users: User[]; total: number }> {
    const [users, total] = await this.userRepository.findAndCount({
      skip: offset,
      take: limit,
      order: { created_at: 'DESC' },
    });

    return { users, total };
  }
}
