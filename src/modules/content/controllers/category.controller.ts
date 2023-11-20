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

import {
  CreateCategoryDto,
  QueryCategoryDto,
  QueryCategoryTreeDto,
  UpdateCategoryDto,
} from '../dtos';
import { CategoryService } from '../services';

@UseInterceptors(AppIntercepter)
@Controller('categories')
export class CategoryController {
  constructor(protected service: CategoryService) {}

  @Get('tree')
  @SerializeOptions({ groups: ['category-tree'] })
  async tree(@Query() options: QueryCategoryTreeDto) {
    return this.service.findTrees(options);
  }

  @Get()
  @SerializeOptions({ groups: ['category-list'] })
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
  @SerializeOptions({ groups: ['category-detail'] })
  async detail(
    @Param('id', new ParseUUIDPipe())
    id: string,
  ) {
    return this.service.detail(id);
  }

  @Post()
  @SerializeOptions({ groups: ['category-detail'] })
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
    data: CreateCategoryDto,
  ) {
    return this.service.create(data);
  }

  @Patch()
  @SerializeOptions({ groups: ['category-detail'] })
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
    data: UpdateCategoryDto,
  ) {
    return this.service.update(data);
  }

  @Delete()
  @SerializeOptions({ groups: ['category-list'] })
  async delete(
    @Body()
    data: DeleteWithTrashDto,
  ) {
    const { ids, trash } = data;
    return this.service.delete(ids, trash);
  }

  @Patch('restore')
  @SerializeOptions({ groups: ['category-list'] })
  async restore(
    @Body()
    data: RestoreDto,
  ) {
    const { ids } = data;
    return this.service.restore(ids);
  }
}
