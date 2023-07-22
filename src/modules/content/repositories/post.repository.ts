import { Repository } from 'typeorm';

import { CustomRepository } from '@/modules/databse/decorators';

import { PostEntity } from '../entites/post.entity';

@CustomRepository(PostEntity)
export class PostRepository extends Repository<PostEntity> {
  buildBaseQB() {
    return this.createQueryBuilder('post');
  }
}
