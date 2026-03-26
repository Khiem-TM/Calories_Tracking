import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { MuscleGroup } from '../../../common/enums/muscle-group.enum';
import { TrainingIntensity } from '../../../common/enums/training-intensity.enum';

@Entity('exercises')
export class Exercise {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string;

  @Column({
    name: 'primary_muscle_group',
    type: 'enum',
    enum: MuscleGroup,
  })
  primaryMuscleGroup!: MuscleGroup;

  @Column({
    type: 'enum',
    enum: TrainingIntensity,
  })
  intensity!: TrainingIntensity;

  @Column({ name: 'met_value', type: 'decimal', precision: 5, scale: 2, default: 0 })
  metValue!: number; // Metabolic Equivalent of Task

  @Column({ type: 'text', nullable: true })
  instructions!: string;

  @Column({ name: 'video_url', type: 'text', nullable: true })
  videoUrl!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
