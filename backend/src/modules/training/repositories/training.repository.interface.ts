import { Exercise } from '../entities/exercise.entity';
import { WorkoutSession } from '../entities/workout-session.entity';
import { TrainingGoal } from '../entities/training-goal.entity';
import { MuscleGroup } from '../../../common/enums/muscle-group.enum';

export interface IExercisesRepository {
  findAll(query: { name?: string, muscleGroup?: MuscleGroup }): Promise<Exercise[]>;
  findById(id: string): Promise<Exercise | null>;
}

export interface IWorkoutSessionsRepository {
  save(session: Partial<WorkoutSession>): Promise<WorkoutSession>;
  findByUser(userId: string, limit: number): Promise<WorkoutSession[]>;
  findByDateRange(userId: string, from: string, to: string): Promise<WorkoutSession[]>;
}

export interface ITrainingGoalsRepository {
  save(goal: Partial<TrainingGoal>): Promise<TrainingGoal>;
  findByUser(userId: string): Promise<TrainingGoal[]>;
  findById(id: string): Promise<TrainingGoal | null>;
  updateProgress(goalId: string, progress: number): Promise<void>;
}
