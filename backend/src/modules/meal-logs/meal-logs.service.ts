import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MealLog } from './entities/meal-log.entity';
import { MealLogItem } from './entities/meal-log-item.entity';
import { CreateMealLogDto, CreateMealLogItemDto } from './dto/create-meal-log.dto';
import { Food } from '../foods/entities/food.entity';

@Injectable()
export class MealLogsService {
  constructor(
    @InjectRepository(MealLog)
    private readonly mealLogRepository: Repository<MealLog>,
    @InjectRepository(MealLogItem)
    private readonly mealLogItemRepository: Repository<MealLogItem>,
    @InjectRepository(Food)
    private readonly foodRepository: Repository<Food>,
  ) {}

  async create(userId: string, dto: CreateMealLogDto): Promise<MealLog> {
    // Check if meal log already exists for date + type
    let log = await this.mealLogRepository.findOne({
      where: { user_id: userId, log_date: dto.log_date, meal_type: dto.meal_type },
      relations: ['items'],
    });

    if (!log) {
      log = this.mealLogRepository.create({
        user_id: userId,
        log_date: dto.log_date,
        meal_type: dto.meal_type,
        notes: dto.notes,
      });
      log = await this.mealLogRepository.save(log);
    }

    if (dto.items && dto.items.length > 0) {
      for (const itemDto of dto.items) {
        await this.addItemToLog(userId, log.id, itemDto);
      }
      log = await this.mealLogRepository.findOne({
        where: { id: log.id },
        relations: ['items', 'items.food'],
      }) as MealLog;
    }

    return log;
  }

  async findAllByUser(userId: string, date?: string): Promise<MealLog[]> {
    const query: any = { user_id: userId };
    if (date) query.log_date = date;

    return this.mealLogRepository.find({
      where: query,
      relations: ['items', 'items.food'],
      order: { log_date: 'DESC' },
    });
  }

  async findOne(userId: string, id: string): Promise<MealLog> {
    const log = await this.mealLogRepository.findOne({
      where: { id, user_id: userId },
      relations: ['items', 'items.food'],
    });
    if (!log) throw new NotFoundException('Meal log not found');
    return log;
  }

  async addItemToLog(userId: string, logId: string, itemDto: CreateMealLogItemDto): Promise<MealLogItem> {
    const log = await this.findOne(userId, logId);
    if (!log) throw new NotFoundException('Meal log not found');

    const food = await this.foodRepository.findOne({ where: { id: itemDto.food_id } });
    if (!food) throw new NotFoundException('Food not found');

    // Convert to grams based on serving - assuming 'serving_size_g' is the base per 1 serving_unit
    // OR if user specifies generic "g", quantity is just grams.
    let quantity_in_grams = itemDto.quantity;
    if (itemDto.serving_unit.toLowerCase() !== 'g' && food.serving_unit === itemDto.serving_unit) {
      quantity_in_grams = itemDto.quantity * food.serving_size_g;
    } else if (itemDto.serving_unit.toLowerCase() !== 'g') {
       // fallback: assuming standard unit scaling is not supported unless matches food explicitly
       quantity_in_grams = itemDto.quantity * food.serving_size_g;
    }

    const ratio = quantity_in_grams / 100;
    const newItem = this.mealLogItemRepository.create({
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
    });

    return this.mealLogItemRepository.save(newItem);
  }

  async removeItemFromLog(userId: string, logId: string, itemId: string): Promise<void> {
    const log = await this.findOne(userId, logId);
    if (!log) throw new NotFoundException('Meal log not found');
    await this.mealLogItemRepository.delete({ id: itemId, meal_log_id: log.id });
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
