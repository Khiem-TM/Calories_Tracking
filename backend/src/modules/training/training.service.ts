import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import {
  EXERCISES_REPOSITORY,
  WORKOUT_SESSIONS_REPOSITORY,
  TRAINING_GOALS_REPOSITORY,
} from './training.constants';
import type {
  IExercisesRepository,
  IWorkoutSessionsRepository,
  ITrainingGoalsRepository,
} from './repositories/training.repository.interface';
import { ExerciseQueryDto, LogWorkoutDto, CreateTrainingGoalDto } from './dto/training.dto';
import { BodyMetricsService } from '../body-metrics/services/body-metrics.service';
import { StreaksService } from '../streaks/streaks.service';
import { UsersService } from '../users/users.service';
import { TrainingGoalType } from '../../common/enums/training-goal-type.enum';

@Injectable()
export class TrainingService {
  constructor(
    @Inject(EXERCISES_REPOSITORY)
    private readonly exerciseRepo: IExercisesRepository,
    @Inject(WORKOUT_SESSIONS_REPOSITORY)
    private readonly sessionRepo: IWorkoutSessionsRepository,
    @Inject(TRAINING_GOALS_REPOSITORY)
    private readonly goalRepo: ITrainingGoalsRepository,
    private readonly bodyMetricsService: BodyMetricsService,
    private readonly streaksService: StreaksService,
    private readonly usersService: UsersService,
  ) {}

  async getExercises(query: ExerciseQueryDto) {
    return this.exerciseRepo.findAll(query);
  }

  async logWorkout(userId: string, dto: LogWorkoutDto) {
    const exercise = await this.exerciseRepo.findById(dto.exerciseId);
    if (!exercise) throw new NotFoundException('Exercise not found');

    // Get weight for calorie calculation
    let weight = 70; // fallback
    const latestMetric = await this.bodyMetricsService.getLatest(userId);
    if (latestMetric && latestMetric.weightKg) {
      weight = latestMetric.weightKg;
    } else {
      const profile = await this.usersService.getHealthProfile(userId);
      if (profile && profile.initialWeightKg) {
        weight = profile.initialWeightKg;
      }
    }

    // Calories = MET * Weight(kg) * Duration(hours)
    const durationHours = dto.durationMinutes / 60;
    const caloriesBurned = Number(exercise.metValue) * weight * durationHours;

    const session = await this.sessionRepo.save({
      userId,
      exerciseId: dto.exerciseId,
      sessionDate: dto.sessionDate,
      durationMinutes: dto.durationMinutes,
      weightKg: dto.weightKg,
      sets: dto.sets,
      repsPerSet: dto.repsPerSet,
      notes: dto.notes,
      caloriesBurnedSnapshot: Number(caloriesBurned.toFixed(2)),
    });

    // Update streak
    await this.streaksService.updateActivity(userId, 'workout', dto.sessionDate);

    return session;
  }

  async getWorkoutHistory(userId: string, limit: number = 20) {
    return this.sessionRepo.findByUser(userId, limit);
  }

  async createGoal(userId: string, dto: CreateTrainingGoalDto) {
    // 1. Calculate macros from TDEE if possible
    const latestMetric = await this.bodyMetricsService.getLatest(userId);
    let calories = 0;
    let protein = 0;
    let fat = 0;
    let carbs = 0;

    if (latestMetric && latestMetric.tdee) {
      const tdee = Number(latestMetric.tdee);
      
      // Basic logic based on goal type
      if (dto.goalType === TrainingGoalType.LOSE_WEIGHT) {
        calories = tdee - 500;
      } else if (dto.goalType === TrainingGoalType.GAIN_MUSCLE) {
        calories = tdee + 300;
      } else {
        calories = tdee;
      }

      // Simple Macro Split: 30% Protein, 30% Fat, 40% Carbs
      protein = (calories * 0.3) / 4;
      fat = (calories * 0.3) / 9;
      carbs = (calories * 0.4) / 4;
    }

    return this.goalRepo.save({
      userId,
      ...dto,
      dailyCaloriesGoal: calories || undefined,
      proteinG: protein || undefined,
      fatG: fat || undefined,
      carbsG: carbs || undefined,
    } as any);
  }

  async getMyGoals(userId: string) {
    return this.goalRepo.findByUser(userId);
  }
}
