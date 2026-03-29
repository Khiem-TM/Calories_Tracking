import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { TrainingService } from './training.service';
import { JwtAuthGuard } from '../../common/guards/jwt.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
import {
  ExerciseQueryDto,
  LogWorkoutDto,
  CreateTrainingGoalDto,
} from './dto/training.dto';
import {
  UpdateTrainingGoalDto,
  UpdateWorkoutSessionDto,
} from './dto/update-training.dto';

@ApiTags('training')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('training')
export class TrainingController {
  constructor(private readonly trainingService: TrainingService) {}

  @ApiOperation({ summary: 'Get exercises (filter by name, muscleGroup)' })
  @Get('exercises')
  getExercises(@Query() query: ExerciseQueryDto) {
    return this.trainingService.getExercises(query);
  }

  @ApiOperation({ summary: 'Upload an image for an exercise' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
      required: ['file'],
    },
  })
  @Post('exercises/:id/image')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  uploadExerciseImage(
    @Param('id') id: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: /image\/(jpeg|jpg|png|webp)/ }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.trainingService.uploadExerciseImage(id, file);
  }

  @ApiOperation({ summary: 'Log a workout session' })
  @Post('workout')
  logWorkout(@CurrentUser() user: JwtPayload, @Body() dto: LogWorkoutDto) {
    return this.trainingService.logWorkout(user.sub, dto);
  }

  @ApiOperation({ summary: 'Get workout history' })
  @Get('history')
  getHistory(@CurrentUser() user: JwtPayload, @Query('limit') limit?: number) {
    return this.trainingService.getWorkoutHistory(user.sub, limit ? Number(limit) : 20);
  }

  @ApiOperation({ summary: 'Update a workout session' })
  @Patch('workout/:id')
  updateWorkout(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateWorkoutSessionDto,
  ) {
    return this.trainingService.updateWorkout(user.sub, id, dto);
  }

  @ApiOperation({ summary: 'Delete a workout session' })
  @Delete('workout/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteWorkout(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.trainingService.deleteWorkout(user.sub, id);
  }

  @ApiOperation({ summary: 'Get training goals' })
  @Get('goals')
  getGoals(@CurrentUser() user: JwtPayload) {
    return this.trainingService.getMyGoals(user.sub);
  }

  @ApiOperation({ summary: 'Create a training goal' })
  @Post('goals')
  createGoal(@CurrentUser() user: JwtPayload, @Body() dto: CreateTrainingGoalDto) {
    return this.trainingService.createGoal(user.sub, dto);
  }

  @ApiOperation({ summary: 'Update a training goal' })
  @Patch('goals/:id')
  updateGoal(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateTrainingGoalDto,
  ) {
    return this.trainingService.updateGoal(user.sub, id, dto);
  }

  @ApiOperation({ summary: 'Delete a training goal' })
  @Delete('goals/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteGoal(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.trainingService.deleteGoal(user.sub, id);
  }
}
