import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../common/guards/jwt.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
import { User } from './entities/user.entity';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getCurrentUser(@CurrentUser() user: JwtPayload): Promise<User> {
    return this.usersService.findById(user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  async updateProfile(
    @CurrentUser() user: JwtPayload,
    @Body() updateData: { display_name?: string; avatar_url?: string },
  ): Promise<User> {
    return this.usersService.updateProfile(user.sub, updateData);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me/deactivate')
  async deactivateAccount(@CurrentUser() user: JwtPayload): Promise<{ message: string }> {
    await this.usersService.deactivateAccount(user.sub);
    return { message: 'Account deactivated successfully' };
  }
}
