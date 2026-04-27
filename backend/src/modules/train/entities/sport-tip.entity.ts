import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Exercise } from './exercise.entity';
import { MuscleGroup } from '../../../common/enums/muscle-group.enum';

@Entity('sport_tips')
export class SportTip {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  sport_category: string | null;

  @Column({ type: 'enum', enum: MuscleGroup, nullable: true })
  muscle_group: MuscleGroup | null;

  @Column({ type: 'text', array: true, nullable: true, default: null })
  tags: string[] | null;

  @Column({ type: 'text', nullable: true })
  thumbnail_url: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  thumbnail_public_id: string | null;

  @Column({ type: 'varchar', length: 100, default: 'Admin' })
  author: string;

  @Column({ type: 'boolean', default: false })
  is_published: boolean;
  
  @ManyToOne(() => Exercise, (exercise) => exercise.tips, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'exercise_id' })
  exercise: Exercise | null;

  @Column({ name: 'exercise_id', type: 'uuid', nullable: true })
  exercise_id: string | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
