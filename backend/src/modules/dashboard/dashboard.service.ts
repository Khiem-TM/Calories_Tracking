import { Injectable } from '@nestjs/common';
import { MealLogsService } from '../meal-logs/meal-logs.service';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { BodyMetricsService } from '../body-metrics/services/body-metrics.service';
import { StreaksService } from '../streaks/streaks.service';
import { TrainingService } from '../training/training.service';

@Injectable()
export class DashboardService {
  constructor(
    private readonly mealLogsService: MealLogsService,
    private readonly activityLogsService: ActivityLogsService,
    private readonly bodyMetricsService: BodyMetricsService,
    private readonly streaksService: StreaksService,
    private readonly trainingService: TrainingService,
  ) {}

  async getUserDailyDashboard(userId: string, date: string) {
    const [meals, activity, latestMetric, streaks, training] =
      await Promise.all([
        this.mealLogsService.getDailySummary(userId, date),
        this.activityLogsService.getByDate(userId, date),
        this.bodyMetricsService.getLatest(userId),
        this.streaksService.getStreaks(userId),
        this.trainingService.getWorkoutHistory(userId, 5),
      ]);

    return {
      date,
      nutrition: {
        total_calories: meals.total_calories,
        total_protein: meals.total_protein,
        total_fat: meals.total_fat,
        total_carbs: meals.total_carbs,
        meal_logs: meals.logs,
      },
      activity: {
        steps: activity?.steps || 0,
        calories_burned: activity?.caloriesBurned || 0,
        water_ml: activity?.waterMl || 0,
      },
      body: {
        current_weight: latestMetric?.weightKg || null,
        bmi: latestMetric?.bmi || null,
      },
      streaks,
      recent_workouts: training,
    };
  }
}
