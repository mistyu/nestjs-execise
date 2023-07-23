import { Injectable } from '@nestjs/common';
import { isNil, isFunction, omit } from 'lodash';

import { EntityNotFoundError, IsNull, Not, SelectQueryBuilder } from 'typeorm';

import { paginate } from '@/modules/databse/helpers';
import { PaginateOptions, QueryHook } from '@/modules/databse/types';

import { PostOrderType } from '../constants';
import { PostEntity } from '../entites/post.entity';
import { PostRepository } from '../repositories';

@Injectable()
export class PostService {
  constructor(protected repository: PostRepository) {}

  // 分页
  async paginate(options: PaginateOptions, callback?: QueryHook<PostEntity>) {
    const qb = await this.buildListQuery(
      this.repository.buildBaseQB(),
      options,
      async (qbuilder) => qbuilder,
    );
    return paginate(qb, options);
  }

  // 详情
  async detail(id: string, callback?: any) {
    let qb = this.repository.buildBaseQB();
    qb.where(`post.id = :id`, { id });
    qb = !isNil(callback) && isFunction(callback) ? await callback(qb) : qb;
    const item = await qb.getOne();
    if (!item)
      throw new EntityNotFoundError(PostEntity, `The post ${id} not exists!`);
    return item;
  }

  // 创建
  async create(data: Record<string, any>) {
    const item = await this.repository.save(data);
    return this.detail(item.id);
  }

  // 更新
  async update(data: Record<string, any>) {
    await this.repository.update(data.id, omit(data, ['id']));
    return this.detail(data.id);
  }

  // 删除
  async delete(id: string) {
    const item = await this.repository.findOneByOrFail({ id });
    return this.repository.remove(item);
  }

  /**
   * 构建文章列表查询器
   * @param qb 初始查询构造器
   * @param options 排查分页选项后的查询选项
   * @param callback 添加额外的查询
   */
  protected async buildListQuery(
    qb: SelectQueryBuilder<PostEntity>,
    options: Record<string, any>,
    callback?: QueryHook<PostEntity>,
  ) {
    const { orderBy, isPublished } = options;
    let newQb = qb;
    if (typeof isPublished === 'boolean') {
      newQb = isPublished
        ? newQb.where({
            publishedAt: Not(IsNull()),
          })
        : newQb.where({
            publishedAt: IsNull(),
          });
    }
    newQb = this.queryOrderBy(newQb, orderBy);
    if (callback) return callback(newQb);
    return newQb;
  }

  /**
   *  对文章进行排序的Query构建
   * @param qb
   * @param orderBy 排序方式
   */
  protected queryOrderBy(
    qb: SelectQueryBuilder<PostEntity>,
    orderBy?: PostOrderType,
  ) {
    switch (orderBy) {
      case PostOrderType.CREATED:
        return qb.orderBy('post.createdAt', 'DESC');
      case PostOrderType.UPDATED:
        return qb.orderBy('post.updatedAt', 'DESC');
      case PostOrderType.PUBLISHED:
        return qb.orderBy('post.publishedAt', 'DESC');
      case PostOrderType.CUSTOM:
        return qb.orderBy('customOrder', 'DESC');
      default:
        return qb
          .orderBy('post.createdAt', 'DESC')
          .addOrderBy('post.updatedAt', 'DESC')
          .addOrderBy('post.publishedAt', 'DESC');
    }
  }
}
