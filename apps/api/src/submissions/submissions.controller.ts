import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { SubmissionsService } from './submissions.service';
import { SubmitFormDto } from '../forms/dto/submit-form.dto';
import { FormDataViewDto } from '@saas/shared';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ActiveUserGuard } from '../common/guards/active-user.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller()
export class SubmissionsController {
  constructor(private readonly submissionsService: SubmissionsService) {}

  @Post('public/forms/:publicId/submissions')
  submitPublicForm(
    @Param('publicId') publicId: string,
    @Body() dto: SubmitFormDto,
  ): Promise<{ message: string; id: string }> {
    return this.submissionsService.submit(publicId, dto);
  }

  @Get('forms/:id/data')
  @UseGuards(JwtAuthGuard, ActiveUserGuard)
  getDataView(
    @CurrentUser('id') userId: string,
    @Param('id') formId: string,
  ): Promise<FormDataViewDto> {
    return this.submissionsService.getDataView(userId, formId);
  }
}
