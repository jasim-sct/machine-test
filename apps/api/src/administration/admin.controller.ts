import {
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ActiveUserGuard } from '../common/guards/active-user.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role, UserDto } from '@saas/shared';

@Controller('admin')
@UseGuards(JwtAuthGuard, ActiveUserGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  listUsers(@Query('search') search?: string): Promise<UserDto[]> {
    return this.adminService.listUsers(search);
  }

  @Get('users/:id')
  getUser(@Param('id') id: string): Promise<UserDto> {
    return this.adminService.getUserById(id);
  }

  @Patch('users/:id/suspend')
  suspendUser(
    @Param('id') id: string,
    @CurrentUser('id') currentAdminId: string,
  ): Promise<UserDto> {
    return this.adminService.suspendUser(id, currentAdminId);
  }

  @Patch('users/:id/unsuspend')
  unsuspendUser(@Param('id') id: string): Promise<UserDto> {
    return this.adminService.unsuspendUser(id);
  }
}
