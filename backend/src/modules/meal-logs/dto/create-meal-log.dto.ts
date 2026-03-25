import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsIn,
  IsDateString,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateMealLogItemDto {
  @IsUUID()
  food_id!: string;

  @IsNumber()
  @Min(0.01)
  quantity!: number;

  @IsString()
  @IsNotEmpty()
  serving_unit!: string;

  @IsString()
  @IsIn(['manual', 'ai_scan', 'barcode', 'history', 'favorite'])
  @IsOptional()
  source?: 'manual' | 'ai_scan' | 'barcode' | 'history' | 'favorite';
}

export class CreateMealLogDto {
  @IsDateString()
  log_date!: string;

  @IsString()
  @IsIn(['breakfast', 'lunch', 'dinner', 'snack'])
  meal_type!: 'breakfast' | 'lunch' | 'dinner' | 'snack';

  @IsString()
  @IsOptional()
  notes?: string;

  @IsOptional()
  items?: CreateMealLogItemDto[];
}
