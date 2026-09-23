import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ActiveUserGuard } from '../common/guards/active-user.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { FormsService } from './forms.service';
import { CreateFormDto } from './dto/create-form.dto';
import { CreateVersionDto } from './dto/create-version.dto';
import { UpdateVersionDto } from './dto/update-version.dto';
import { FormDto, FormVersionDto, FormDataViewDto } from '@saas/shared';

@Controller('forms')
@UseGuards(JwtAuthGuard, ActiveUserGuard)
export class FormsController {
  constructor(private readonly formsService: FormsService) {}

  @Post()
  create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateFormDto,
  ): Promise<FormDto> {
    return this.formsService.create(userId, dto);
  }

  @Get()
  findAll(@CurrentUser('id') userId: string): Promise<FormDto[]> {
    return this.formsService.findAllForUser(userId);
  }

  @Get(':id')
  findOne(
    @CurrentUser('id') userId: string,
    @Param('id') formId: string,
  ): Promise<FormDto> {
    return this.formsService.findOne(userId, formId);
  }

  @Get(':id/data')
  getDataView(
    @CurrentUser('id') userId: string,
    @Param('id') formId: string,
  ): Promise<FormDataViewDto> {
    return this.formsService.getDataView(userId, formId);
  }

  @Post(':id/versions')
  createVersion(
    @CurrentUser('id') userId: string,
    @Param('id') formId: string,
    @Body() dto: CreateVersionDto,
  ): Promise<FormVersionDto> {
    return this.formsService.createVersion(userId, formId, dto);
  }

  @Patch(':id/versions/:versionId')
  updateVersion(
    @CurrentUser('id') userId: string,
    @Param('id') formId: string,
    @Param('versionId') versionId: string,
    @Body() dto: UpdateVersionDto,
  ): Promise<FormVersionDto> {
    return this.formsService.updateVersion(userId, formId, versionId, dto);
  }

  @Post(':id/versions/:versionId/deploy')
  deployVersion(
    @CurrentUser('id') userId: string,
    @Param('id') formId: string,
    @Param('versionId') versionId: string,
  ): Promise<FormDto> {
    return this.formsService.deployVersion(userId, formId, versionId);
  }
}
