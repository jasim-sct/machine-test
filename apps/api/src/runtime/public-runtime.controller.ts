import { Controller, Get, Headers, HttpStatus, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import { RuntimeService } from './runtime.service';

@Controller('public/forms')
export class PublicRuntimeController {
  constructor(private readonly runtimeService: RuntimeService) {}

  @Get(':publicId')
  async getPublicForm(
    @Param('publicId') publicId: string,
    @Headers('if-none-match') ifNoneMatch: string | undefined,
    @Res() res: Response,
  ) {
    const { dto, etag } = await this.runtimeService.getPublicForm(publicId);

    res.setHeader('ETag', etag);
    res.setHeader('Cache-Control', 'public, no-cache');

    if (ifNoneMatch && ifNoneMatch === etag) {
      return res.status(HttpStatus.NOT_MODIFIED).send();
    }

    return res.status(HttpStatus.OK).json(dto);
  }
}
