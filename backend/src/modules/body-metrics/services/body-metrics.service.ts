import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { BODY_METRICS_REPOSITORY } from '../body-metrics.constants';
import type { IBodyMetricsRepository } from '../repositories/body-metrics.repository.interface';
import { UpsertBodyMetricDto } from '../dto/upsert-body-metric.dto';
import { BodyMetricQueryDto } from '../dto/body-metric-query.dto';
import { UsersService } from '../../users/users.service';
import { BMIUtil } from '../../../common/utils/bmi.util';
import { TDEEUtil } from '../../../common/utils/tdee.util';

@Injectable()
export class BodyMetricsService {
  constructor(
    @Inject(BODY_METRICS_REPOSITORY)
    private readonly repository: IBodyMetricsRepository,
    private readonly usersService: UsersService,
  ) {}

  async upsert(userId: string, dto: UpsertBodyMetricDto) {
    const metric: any = { ...dto }; // Initialize metric object with DTO properties

    if (dto.weightKg) {
      const profile = await this.usersService.getHealthProfile(userId);
      console.log(
        'DEBUG: Upserting metric for user',
        userId,
        'Profile:',
        profile,
      );
      if (profile && profile.heightCm) {
        metric.bmi = BMIUtil.calculate(dto.weightKg, profile.heightCm);
        console.log('DEBUG: BMI Calculated:', metric.bmi);

        if (profile.birthDate && profile.gender && profile.activityLevel) {
          const birthDate = new Date(profile.birthDate);
          const age = new Date().getFullYear() - birthDate.getFullYear();
          const bmr = TDEEUtil.calculateBMR(
            dto.weightKg,
            profile.heightCm,
            age,
            profile.gender,
          );
          metric.bmr = bmr;
          metric.tdee = TDEEUtil.calculateTDEE(bmr, profile.activityLevel);
          console.log('DEBUG: BMR/TDEE Calculated:', metric.bmr, metric.tdee);
        } else {
          console.log('DEBUG: Missing profile data for TDEE:', {
            birthDate: !!profile.birthDate,
            gender: !!profile.gender,
            activityLevel: !!profile.activityLevel,
          });
        }
      }
    }

    return this.repository.upsert(userId, metric);
  }

  async getHistory(userId: string, query: BodyMetricQueryDto) {
    return this.repository.findHistory(userId, query);
  }

  async getLatest(userId: string) {
    return this.repository.findLatest(userId);
  }

  async getRange(userId: string, fromDate: string, toDate: string) {
    return this.repository.findRange(userId, fromDate, toDate);
  }

  async getProgressSummary(userId: string) {
    const history = await this.repository.findHistory(userId, { limit: 1000 });
    if (history.length === 0) {
      return {
        startWeight: 0,
        currentWeight: 0,
        weightChange: 0,
        startDate: null,
        latestDate: null,
        totalRecords: 0,
      };
    }

    // Sort by date ASC to find the first record
    const sorted = [...history].sort(
      (a, b) =>
        new Date(a.recordedDate).getTime() - new Date(b.recordedDate).getTime(),
    );

    const first = sorted[0];
    const latest = sorted[sorted.length - 1];

    const startWeight = first.weightKg || 0;
    const currentWeight = latest.weightKg || 0;

    return {
      startWeight,
      currentWeight,
      weightChange: Number((currentWeight - startWeight).toFixed(1)),
      startDate: first.recordedDate,
      latestDate: latest.recordedDate,
      totalRecords: history.length,
    };
  }

  async getPhotosByUser(userId: string, limit: number = 10) {
    return this.repository.findPhotosByUser(userId, limit);
  }

  // Note: uploadProgressPhoto would require a StorageService.
  // For now we'll implement the metadata saving part.
  async savePhotoMetadata(
    userId: string,
    data: { photoUrl: string; photoType: string; bodyMetricId?: string },
  ) {
    return this.repository.savePhoto({
      userId,
      ...data,
    });
  }
}
