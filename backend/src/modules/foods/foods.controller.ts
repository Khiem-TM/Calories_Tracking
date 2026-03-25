import { Controller, Get, Post, Delete, Param, Query, Body, UseGuards } from '@nestjs/common';
import { FoodsService } from './foods.service';
import { JwtAuthGuard } from '../../common/guards/jwt.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
import { CreateFoodDto } from './dto/create-food.dto';

@Controller('foods')
export class FoodsController {
  constructor(private readonly foodsService: FoodsService) {}

  @Get()
  async getFoods(@Query('search') search: string, @Query('page') page: string = '1') {
    return this.foodsService.findAll(search, parseInt(page, 10), 20);
  }

  @UseGuards(JwtAuthGuard)
  @Get('favorites')
  async getFavorites(@CurrentUser() user: JwtPayload) {
    return this.foodsService.getFavorites(user.sub);
  }

  @Get(':id')
  async getFood(@Param('id') id: string) {
    return this.foodsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async createCustomFood(@CurrentUser() user: JwtPayload, @Body() body: CreateFoodDto) {
    return this.foodsService.createCustom(user.sub, body);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/favorite')
  async addFavorite(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    await this.foodsService.addFavorite(user.sub, id);
    return { message: 'Added to favorites' };
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id/favorite')
  async removeFavorite(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    await this.foodsService.removeFavorite(user.sub, id);
    return { message: 'Removed from favorites' };
  }
}
