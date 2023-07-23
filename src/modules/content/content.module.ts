import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DatabaseModule } from '../databse/database.module';

import { PostController } from './controllers';
import { PostEntity } from './entites/post.entity';
import { PostRepository } from './repositories';
import { PostService, SanitizeService } from './services';
import { PostSubscriber } from './subscribers';

@Module({
  imports: [
    TypeOrmModule.forFeature([PostEntity]),
    DatabaseModule.forRepository([PostRepository]),
  ],
  controllers: [PostController],
  providers: [PostService, SanitizeService, PostSubscriber],
  exports: [PostService],
})
export class ContentModule {}
