import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Food } from '../foods/entities/food.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Food)
    private readonly foodRepo: Repository<Food>,
  ) {}

  // ─── Users ────────────────────────────────────────────────────────────────

  async getUsers(page = 1, limit = 20, search?: string) {
    const [users, total] = await this.userRepo.findAndCount({
      where: search ? [{ email: ILike(`%${search}%`) }, { display_name: ILike(`%${search}%`) }] : {},
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { users, total, page, limit };
  }

  async getUserById(id: string): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async banUser(id: string): Promise<User> {
    const user = await this.getUserById(id);
    user.is_active = false;
    return this.userRepo.save(user);
  }

  async unbanUser(id: string): Promise<User> {
    const user = await this.getUserById(id);
    user.is_active = true;
    return this.userRepo.save(user);
  }

  // ─── Foods ────────────────────────────────────────────────────────────────

  async getPendingFoods(page = 1, limit = 20) {
    const [foods, total] = await this.foodRepo.findAndCount({
      where: { is_verified: false, is_active: true },
      order: { created_at: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { foods, total, page, limit };
  }

  async verifyFood(id: string): Promise<Food> {
    const food = await this.foodRepo.findOne({ where: { id } });
    if (!food) throw new NotFoundException('Food not found');
    food.is_verified = true;
    return this.foodRepo.save(food);
  }

  async rejectFood(id: string): Promise<void> {
    const food = await this.foodRepo.findOne({ where: { id } });
    if (!food) throw new NotFoundException('Food not found');
    food.is_active = false;
    await this.foodRepo.save(food);
  }

  async deleteFood(id: string): Promise<void> {
    const food = await this.foodRepo.findOne({ where: { id } });
    if (!food) throw new NotFoundException('Food not found');
    await this.foodRepo.delete(id);
  }

  async getStats() {
    const [totalUsers, activeUsers, totalFoods, pendingFoods] = await Promise.all([
      this.userRepo.count(),
      this.userRepo.count({ where: { is_active: true } }),
      this.foodRepo.count({ where: { is_active: true } }),
      this.foodRepo.count({ where: { is_verified: false, is_active: true } }),
    ]);
    return { totalUsers, activeUsers, totalFoods, pendingFoods };
  }
}
