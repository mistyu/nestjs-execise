import { Injectable } from '@nestjs/common';
import { isNil, isFunction, omit } from 'lodash';

import { EntityNotFoundError } from 'typeorm';

import { PostEntity } from '../entites/post.entity';
import { PostRepository } from '../repositories';

@Injectable()
export class PostService {
  constructor(protected repository: PostRepository) {}

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
}
