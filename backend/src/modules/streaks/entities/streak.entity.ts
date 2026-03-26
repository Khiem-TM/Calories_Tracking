import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';

@Entity('streaks')
@Unique(['user_id', 'streak_type'])
export class Streak {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  user_id!: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'login',
  })
  streak_type!: 'login' | 'calorie_goal' | 'workout';

  @Column({ default: 0 })
  current_streak!: number;

  @Column({ default: 0 })
  longest_streak!: number;

  @Column({ type: 'date', nullable: true })
  last_activity_date!: string;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
