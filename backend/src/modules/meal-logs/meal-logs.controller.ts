import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { MealLogsService } from './meal-logs.service';
import { CreateMealLogDto, CreateMealLogItemDto } from './dto/create-meal-log.dto';
import { JwtAuthGuard } from '../../common/guards/jwt.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../common/interfaces/jwt-payload.interface';

@Controller('meal-logs')
@UseGuards(JwtAuthGuard)
export class MealLogsController {
  constructor(private readonly mealLogsService: MealLogsService) {}

  @Post()
  create(@CurrentUser() user: JwtPayload, @Body() createMealLogDto: CreateMealLogDto) {
    return this.mealLogsService.create(user.sub, createMealLogDto);
  }

  @Get()
  findAll(@CurrentUser() user: JwtPayload, @Query('date') date?: string) {
    return this.mealLogsService.findAllByUser(user.sub, date);
  }

  @Get('summary')
  getSummary(@CurrentUser() user: JwtPayload, @Query('date') date: string) {
    return this.mealLogsService.getDailySummary(user.sub, date);
  }

  @Get(':id')
  findOne(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.mealLogsService.findOne(user.sub, id);
  }

  @Post(':id/items')
  addItem(@CurrentUser() user: JwtPayload, @Param('id') id: string, @Body() itemDto: CreateMealLogItemDto) {
    return this.mealLogsService.addItemToLog(user.sub, id, itemDto);
  }

  @Delete(':id/items/:itemId')
  removeItem(@CurrentUser() user: JwtPayload, @Param('id') id: string, @Param('itemId') itemId: string) {
    return this.mealLogsService.removeItemFromLog(user.sub, id, itemId);
  }
}
