import { Streak } from '../entities/streak.entity';

export interface IStreaksRepository {
  findOrCreate(userId: string, type: string): Promise<Streak>;
  findByUser(userId: string): Promise<Streak[]>;
  updateStreak(streakId: string, current: number, longest: number, lastDate: string): Promise<Streak>;
  findAllByType(type: string): Promise<Streak[]>;
}
