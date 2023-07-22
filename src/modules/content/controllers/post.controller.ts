import { Controller } from '@nestjs/common';

import { PostService } from '../services';

@Controller('posts')
export class PostController {
  constructor(private postService: PostService) {}
}
