import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../../common/guards/jwt.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';

@ApiTags('admin')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @ApiOperation({ summary: 'Get platform stats' })
  @Get('stats')
  getStats() {
    return this.adminService.getStats();
  }

  // users
  @ApiOperation({ summary: 'List all users' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'search', required: false })
  @Get('users')
  getUsers(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ) {
    return this.adminService.getUsers(
      page ? Number(page) : 1,
      limit ? Number(limit) : 20,
      search,
    );
  }

  @ApiOperation({ summary: 'Get user by ID' })
  @Get('users/:id')
  getUserById(@Param('id') id: string) {
    return this.adminService.getUserById(id);
  }

  @ApiOperation({ summary: 'Ban a user' })
  @Patch('users/:id/ban')
  banUser(@Param('id') id: string) {
    return this.adminService.banUser(id);
  }

  @ApiOperation({ summary: 'Unban a user' })
  @Patch('users/:id/unban')
  unbanUser(@Param('id') id: string) {
    return this.adminService.unbanUser(id);
  }

  // foods
  @ApiOperation({ summary: 'List foods pending verification' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @Get('foods/pending')
  getPendingFoods(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.adminService.getPendingFoods(
      page ? Number(page) : 1,
      limit ? Number(limit) : 20,
    );
  }

  @ApiOperation({ summary: 'Verify (approve) a food entry' })
  @Patch('foods/:id/verify')
  verifyFood(@Param('id') id: string) {
    return this.adminService.verifyFood(id);
  }

  @ApiOperation({ summary: 'Reject a food entry (soft-disable)' })
  @Patch('foods/:id/reject')
  rejectFood(@Param('id') id: string) {
    return this.adminService.rejectFood(id);
  }

  @ApiOperation({ summary: 'Permanently delete a food entry' })
  @Delete('foods/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteFood(@Param('id') id: string) {
    return this.adminService.deleteFood(id);
  }
}
