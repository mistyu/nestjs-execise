import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  SerializeOptions,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';

import { AppIntercepter } from '@/modules/core/providers';

import { DeleteWithTrashDto } from '@/modules/restful/dtos/delete-with-trash.dto';

import { RestoreDto } from '@/modules/restful/dtos/restore.dto';

import { CreateTagDto, QueryCategoryDto, UpdateTagDto } from '../dtos';
import { TagService } from '../services';

@UseInterceptors(AppIntercepter)
@Controller('tags')
export class TagController {
  constructor(protected service: TagService) {}

  @Get()
  @SerializeOptions({})
  async list(
    @Query(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
        forbidUnknownValues: true,
        validationError: { target: false },
      }),
    )
    options: QueryCategoryDto,
  ) {
    return this.service.paginate(options);
  }

  @Get(':id')
  @SerializeOptions({})
  async detail(
    @Param('id', new ParseUUIDPipe())
    id: string,
  ) {
    return this.service.detail(id);
  }

  @Post()
  @SerializeOptions({})
  async store(
    @Body(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
        forbidUnknownValues: true,
        validationError: { target: false },
        groups: ['create'],
      }),
    )
    data: CreateTagDto,
  ) {
    return this.service.create(data);
  }

  @Patch()
  @SerializeOptions({})
  async update(
    @Body(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
        forbidUnknownValues: true,
        validationError: { target: false },
        groups: ['update'],
      }),
    )
    data: UpdateTagDto,
  ) {
    return this.service.update(data);
  }

  @Delete()
  @SerializeOptions({ groups: ['post-list'] })
  async delete(
    @Body()
    data: DeleteWithTrashDto,
  ) {
    const { ids, trash } = data;
    return this.service.delete(ids, trash);
  }

  @Patch('restore')
  @SerializeOptions({ groups: ['post-list'] })
  async restore(
    @Body()
    data: RestoreDto,
  ) {
    const { ids } = data;
    return this.service.restore(ids);
  }
}
