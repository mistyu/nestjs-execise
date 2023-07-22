import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PostController } from './controllers';
import { PostEntity } from './entites/post.entity';
import { PostService, SanitiezeService } from './services';
import { PostSubscriber } from './subscribers';

@Module({
  imports: [TypeOrmModule.forFeature([PostEntity])],
  controllers: [PostController],
  providers: [PostService, SanitiezeService, PostSubscriber],
  exports: [PostService],
})
export class ContentModule {}
