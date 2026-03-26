import { Controller, Get, Patch, Body, Query, UseGuards } from '@nestjs/common';
import { ActivityLogsService } from './activity-logs.service';
import { JwtAuthGuard } from '../../common/guards/jwt.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
import { LogStepsDto } from './dto/log-steps.dto';
import { LogCaloriesBurnedDto } from './dto/log-calories-burned.dto';
import { LogWaterDto } from './dto/log-water.dto';
import { ActivityLogQueryDto } from './dto/activity-log-query.dto';

@Controller('activity-logs')
@UseGuards(JwtAuthGuard)
export class ActivityLogsController {
  constructor(private readonly activityLogsService: ActivityLogsService) {}

  @Get()
  async getByDate(
    @CurrentUser() user: JwtPayload,
    @Query() query: ActivityLogQueryDto,
  ) {
    const date = query.date || new Date().toISOString().split('T')[0];
    return this.activityLogsService.getByDate(user.sub, date);
  }

  @Get('range')
  async getRange(
    @CurrentUser() user: JwtPayload,
    @Query() query: ActivityLogQueryDto,
  ) {
    const fromDate = query.fromDate || new Date().toISOString().split('T')[0];
    const toDate = query.toDate || fromDate;
    return this.activityLogsService.getRange(user.sub, fromDate, toDate);
  }

  @Patch('steps')
  async logSteps(@CurrentUser() user: JwtPayload, @Body() dto: LogStepsDto) {
    return this.activityLogsService.logSteps(user.sub, dto);
  }

  @Patch('calories-burned')
  async logCaloriesBurned(
    @CurrentUser() user: JwtPayload,
    @Body() dto: LogCaloriesBurnedDto,
  ) {
    return this.activityLogsService.logCaloriesBurned(user.sub, dto);
  }

  @Patch('water')
  async logWater(@CurrentUser() user: JwtPayload, @Body() dto: LogWaterDto) {
    return this.activityLogsService.logWater(user.sub, dto);
  }
}
