import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MealLogsService } from './meal-logs.service';
import { MealLogsController } from './meal-logs.controller';
import { MealLog } from './entities/meal-log.entity';
import { MealLogItem } from './entities/meal-log-item.entity';
import { Food } from '../foods/entities/food.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MealLog, MealLogItem, Food])],
  controllers: [MealLogsController],
  providers: [MealLogsService],
  exports: [MealLogsService],
})
export class MealLogsModule {}
