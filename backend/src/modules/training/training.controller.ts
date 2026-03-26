import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TrainingService } from './training.service';
import { JwtAuthGuard } from '../../common/guards/jwt.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
import { ExerciseQueryDto, LogWorkoutDto, CreateTrainingGoalDto } from './dto/training.dto';

@Controller('training')
@UseGuards(JwtAuthGuard)
export class TrainingController {
  constructor(private readonly trainingService: TrainingService) {}

  @Get('exercises')
  async getExercises(@Query() query: ExerciseQueryDto) {
    return this.trainingService.getExercises(query);
  }

  @Post('workout')
  async logWorkout(
    @CurrentUser() user: JwtPayload,
    @Body() dto: LogWorkoutDto,
  ) {
    return this.trainingService.logWorkout(user.sub, dto);
  }

  @Get('history')
  async getHistory(
    @CurrentUser() user: JwtPayload,
    @Query('limit') limit?: number,
  ) {
    return this.trainingService.getWorkoutHistory(user.sub, limit ? Number(limit) : 20);
  }

  @Get('goals')
  async getGoals(@CurrentUser() user: JwtPayload) {
    return this.trainingService.getMyGoals(user.sub);
  }

  @Post('goals')
  async createGoal(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateTrainingGoalDto,
  ) {
    return this.trainingService.createGoal(user.sub, dto);
  }
}
