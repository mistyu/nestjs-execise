import { PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsDefined,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsUUID,
} from 'class-validator';

import { DtoValidation } from '@/modules/core/decorators';
import { toBoolean } from '@/modules/core/helpers';
import { PaginateOptions } from '@/modules/database/types';

import { PostOrderType } from '../constants';

export class QueryPostDto implements PaginateOptions {
  page: number;

  limit: number;

  @IsUUID(undefined, { message: 'ID格式错误' })
  @IsOptional()
  category?: string;

  @IsUUID(undefined, { message: 'ID格式错误' })
  @IsOptional()
  tag?: string;

  /**
   * 是否查询已发布(全部文章:不填、只查询已发布的:true、只查询未发布的:false)
   */
  @Transform(({ value }) => toBoolean(value))
  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;

  /**
   * 查询结果排序,不填则综合排序
   */
  @IsEnum(PostOrderType, {
    message: `排序规则必须是${Object.values(PostOrderType).join(',')}其中一项`,
  })
  @IsOptional()
  orderBy?: PostOrderType;
}

export class CreatePostDto {
  @IsUUID(undefined, {
    each: true,
    always: true,
    message: 'ID格式不正确',
  })
  @IsOptional({ groups: ['update'] })
  category: string;

  @IsUUID(undefined, {
    each: true,
    always: true,
    message: 'ID格式不正确',
  })
  @IsNotEmpty({ groups: ['create'], message: '分类必须设置' })
  @IsOptional({ always: true })
  tags?: string[];
}

/**
 * 文章更新验证
 */
@DtoValidation({ groups: ['update'] })
export class UpdatePostDto extends PartialType(CreatePostDto) {
  /**
   * 待更新ID
   */
  @IsUUID(undefined, { groups: ['update'], message: '文章ID格式错误' })
  @IsDefined({ groups: ['update'], message: '文章ID必须指定' })
  id: string;
}
