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
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';

import { AppIntercepter } from '@/modules/core/providers';

import { CreatePostDto, QueryPostDto, UpdatePostDto } from '../dtos';
import { PostService } from '../services';

@UseInterceptors(AppIntercepter)
@Controller('posts')
export class PostController {
  constructor(protected service: PostService) {}

  @Get()
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
    options: QueryPostDto,
  ) {
    return this.service.paginate(options);
  }

  @Get(':id')
  async detail(
    @Param('id', new ParseUUIDPipe())
    id: string,
  ) {
    return this.service.detail(id);
  }

  @Post()
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
    data: CreatePostDto,
  ) {
    return this.service.create(data);
  }

  @Patch()
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
    data: UpdatePostDto,
  ) {
    return this.service.update(data);
  }

  @Delete(':id')
  async delete(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.service.delete(id);
  }

  /**
   * 分页查询文章列表
   * @param options
   */
  // @Get()
  // @SerializeOptions({ groups: ['post-list'] })
  // async list(
  //   @Query()
  //   options: QueryPostDto,
  // ) {
  //   return this.service.paginate(options);
  // }

  // /**
  //  * 查询文章详情
  //  * @param id
  //  */
  // @Get(':id')
  // @SerializeOptions({ groups: ['post-detail'] })
  // async detail(
  //   @Param('id', new ParseUUIDPipe())
  //   id: string,
  // ) {
  //   return this.service.detail(id);
  // }

  // /**
  //  * 新增文章
  //  * @param data
  //  */
  // @Post()
  // @SerializeOptions({ groups: ['post-detail'] })
  // async store(
  //   @Body()
  //   data: CreatePostDto,
  // ) {
  //   return this.service.create(data);
  // }

  // /**
  //  * 查询文章详情
  //  * @param data
  //  */
  // @Patch()
  // @SerializeOptions({ groups: ['post-detail'] })
  // async update(
  //   @Body()
  //   data: UpdatePostDto,
  // ) {
  //   return this.service.update(data);
  // }

  // /**
  //  * 批量删除文章
  //  * @param data
  //  */
  // @Delete()
  // @SerializeOptions({ groups: ['post-list'] })
  // async delete(
  //   @Body()
  //   data: DeleteWithTrashDto,
  // ) {
  //   const { ids, trash } = data;
  //   return this.service.delete(ids, trash);
  // }

  // /**
  //  * 批量恢复文章
  //  * @param data
  //  */
  // @Patch('restore')
  // @SerializeOptions({ groups: ['post-list'] })
  // async restore(
  //   @Body()
  //   data: RestoreDto,
  // ) {
  //   const { ids } = data;
  //   return this.service.restore(ids);
  // }
}
