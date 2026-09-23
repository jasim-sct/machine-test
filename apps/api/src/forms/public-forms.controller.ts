import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { FormsService } from './forms.service';
import { SubmitFormDto } from './dto/submit-form.dto';
import { PublicFormDto } from '@saas/shared';

@Controller('public/forms')
export class PublicFormsController {
  constructor(private readonly formsService: FormsService) {}

  @Get(':publicId')
  getPublicForm(@Param('publicId') publicId: string): Promise<PublicFormDto> {
    return this.formsService.getPublicForm(publicId);
  }

  @Post(':publicId/submissions')
  submitPublicForm(
    @Param('publicId') publicId: string,
    @Body() dto: SubmitFormDto,
  ): Promise<{ message: string; id: string }> {
    return this.formsService.submitPublicForm(publicId, dto);
  }
}
