import { Repository } from 'typeorm';

import { PostEntity } from '../entites/post.entity';

export class PostRepository extends Repository<PostEntity> {
  buildBaseQB() {
    return this.createQueryBuilder('post');
  }
}
