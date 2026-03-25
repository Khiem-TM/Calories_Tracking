import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { MealLogItem } from './meal-log-item.entity';

@Entity('meal_logs')
export class MealLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'date' })
  log_date: string;

  @Column({ type: 'varchar', length: 20 })
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';

  @Column({ type: 'text', nullable: true })
  notes: string;

  @OneToMany(() => MealLogItem, (item: MealLogItem) => item.meal_log, { cascade: true })
  items: MealLogItem[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
