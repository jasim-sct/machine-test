import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { SubmissionsService } from './submissions.service';
import { SubmitFormDto } from '../forms/dto/submit-form.dto';
import { FormDataViewDto, Permission } from '@saas/shared';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ActiveUserGuard } from '../common/guards/active-user.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CurrentTenant } from '../common/decorators/current-tenant.decorator';
import { Throttle } from '@nestjs/throttler';

@Controller()
export class SubmissionsController {
  constructor(private readonly submissionsService: SubmissionsService) {}

  @Post('public/forms/:publicId/submissions')
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  submitPublicForm(
    @Param('publicId') publicId: string,
    @Body() dto: SubmitFormDto,
  ): Promise<{ message: string; id: string }> {
    return this.submissionsService.submit(publicId, dto);
  }

  @Get('forms/:id/data')
  @UseGuards(JwtAuthGuard, ActiveUserGuard, PermissionsGuard)
  @RequirePermissions(Permission.SUBMISSIONS_READ)
  getDataView(
    @CurrentUser('id') userId: string,
    @CurrentTenant() tenantId: string,
    @Param('id') formId: string,
  ): Promise<FormDataViewDto> {
    return this.submissionsService.getDataView(userId, formId, tenantId);
  }
}

