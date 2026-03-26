import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { BodyMetricsService } from '../services/body-metrics.service';
import { JwtAuthGuard } from '../../../common/guards/jwt.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../../common/interfaces/jwt-payload.interface';
import { UpsertBodyMetricDto } from '../dto/upsert-body-metric.dto';
import { BodyMetricQueryDto } from '../dto/body-metric-query.dto';

@Controller('body-metrics')
@UseGuards(JwtAuthGuard)
export class BodyMetricsController {
  constructor(private readonly bodyMetricsService: BodyMetricsService) {}

  @Get()
  async getHistory(
    @CurrentUser() user: JwtPayload,
    @Query() query: BodyMetricQueryDto,
  ) {
    return this.bodyMetricsService.getHistory(user.sub, query);
  }

  @Post()
  async upsert(
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpsertBodyMetricDto,
  ) {
    return this.bodyMetricsService.upsert(user.sub, dto);
  }

  @Get('latest')
  async getLatest(@CurrentUser() user: JwtPayload) {
    return this.bodyMetricsService.getLatest(user.sub);
  }

  @Get('summary')
  async getSummary(@CurrentUser() user: JwtPayload) {
    return this.bodyMetricsService.getProgressSummary(user.sub);
  }

  @Get('photos')
  async getPhotos(
    @CurrentUser() user: JwtPayload,
    @Query('limit') limit?: number,
  ) {
    return this.bodyMetricsService.getPhotosByUser(
      user.sub,
      limit ? Number(limit) : 10,
    );
  }
}
