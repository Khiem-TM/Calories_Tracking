import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MealLog } from './entities/meal-log.entity';
import { MealLogItem } from './entities/meal-log-item.entity';
import { CreateMealLogDto, CreateMealLogItemDto } from './dto/create-meal-log.dto';
import { Food } from '../foods/entities/food.entity';
import { MEAL_LOGS_REPOSITORY } from './meal-logs.constants';
import type { IMealLogsRepository } from './repositories/meal-logs.repository.interface';

@Injectable()
export class MealLogsService {
  constructor(
    @Inject(MEAL_LOGS_REPOSITORY)
    private readonly repository: IMealLogsRepository,
    @InjectRepository(Food)
    private readonly foodRepository: Repository<Food>,
  ) {}

  async create(userId: string, dto: CreateMealLogDto): Promise<MealLog> {
    const log = await this.repository.findOrCreate(userId, dto.log_date, dto.meal_type);

    if (dto.items && dto.items.length > 0) {
      for (const itemDto of dto.items) {
        await this.addItemToLog(userId, log.id, itemDto);
      }
    }

    return this.repository.findById(log.id) as Promise<MealLog>;
  }

  async findAllByUser(userId: string, date?: string): Promise<MealLog[]> {
    return this.repository.findByUser(userId, date);
  }

  async findOne(userId: string, id: string): Promise<MealLog> {
    const log = await this.repository.findById(id);
    if (!log || log.user_id !== userId) throw new NotFoundException('Meal log not found');
    return log;
  }

  async addItemToLog(userId: string, logId: string, itemDto: CreateMealLogItemDto): Promise<MealLogItem> {
    const log = await this.findOne(userId, logId);
    
    const food = await this.foodRepository.findOne({ where: { id: itemDto.food_id } });
    if (!food) throw new NotFoundException('Food not found');

    let quantity_in_grams = itemDto.quantity;
    if (itemDto.serving_unit.toLowerCase() !== 'g' && food.serving_unit === itemDto.serving_unit) {
      quantity_in_grams = itemDto.quantity * food.serving_size_g;
    } else if (itemDto.serving_unit.toLowerCase() !== 'g') {
       quantity_in_grams = itemDto.quantity * food.serving_size_g;
    }

    const ratio = quantity_in_grams / 100;
    const itemData: Partial<MealLogItem> = {
      meal_log_id: log.id,
      food_id: food.id,
      quantity: itemDto.quantity,
      serving_unit: itemDto.serving_unit,
      quantity_in_grams: quantity_in_grams,
      calories_snapshot: food.calories_per_100g * ratio,
      protein_snapshot: food.protein_per_100g * ratio,
      fat_snapshot: food.fat_per_100g * ratio,
      carbs_snapshot: food.carbs_per_100g * ratio,
      fiber_snapshot: (food.fiber_per_100g || 0) * ratio,
      sugar_snapshot: (food.sugar_per_100g || 0) * ratio,
      sodium_snapshot: (food.sodium_per_100g || 0) * ratio,
      source: itemDto.source || 'manual',
    };

    return this.repository.saveItem(itemData);
  }

  async removeItemFromLog(userId: string, logId: string, itemId: string): Promise<void> {
    const item = await this.repository.findItemById(itemId);
    if (!item || item.meal_log_id !== logId) throw new NotFoundException('Item not found');
    
    // Ownership check via parent log
    const log = await this.repository.findById(logId);
    if (!log || log.user_id !== userId) throw new NotFoundException('Meal log not found');

    await this.repository.removeItem(itemId);
  }

  async getDailySummary(userId: string, date: string) {
    const logs = await this.findAllByUser(userId, date);
    
    let totalCalories = 0;
    let totalProtein = 0;
    let totalFat = 0;
    let totalCarbs = 0;

    for (const log of logs) {
      for (const item of log.items || []) {
        totalCalories += Number(item.calories_snapshot || 0);
        totalProtein += Number(item.protein_snapshot || 0);
        totalFat += Number(item.fat_snapshot || 0);
        totalCarbs += Number(item.carbs_snapshot || 0);
      }
    }

    return {
      date,
      total_calories: totalCalories,
      total_protein: totalProtein,
      total_fat: totalFat,
      total_carbs: totalCarbs,
      logs,
    };
  }
}
