import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { FoodsModule } from './modules/foods/foods.module';
import { MealLogsModule } from './modules/meal-logs/meal-logs.module';
import { BodyMetricsModule } from './modules/body-metrics/body-metrics.module';
import { ActivityLogsModule } from './modules/activity-logs/activity-logs.module';
import { StreaksModule } from './modules/streaks/streaks.module';
import { TrainingModule } from './modules/training/training.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const dbHost = configService.get<string>('DB_HOST', 'localhost');
        const dbPort = configService.get<number>('DB_PORT', 5432);
        const dbUser = configService.get<string>('DB_USER', 'postgres');
        const dbPass = configService.get<string>('DB_PASS', '123456');
        const dbName = configService.get<string>('DB_NAME', 'calories_tracker');

        const connStr = `Connecting to ${dbUser}@${dbHost}:${dbPort}/${dbName}`;
        console.log(connStr);

        return {
          type: 'postgres' as const,
          host: dbHost,
          port: dbPort,
          username: dbUser,
          password: dbPass,
          database: dbName,
          autoLoadEntities: true,
          synchronize: true,
        };
      },
    }),

    AuthModule,
    UsersModule,
    FoodsModule,
    MealLogsModule,
    BodyMetricsModule,
    ActivityLogsModule,
    StreaksModule,
    TrainingModule,
    DashboardModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
