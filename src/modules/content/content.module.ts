import { Module, ModuleMetadata } from '@nestjs/common';

import { Configure } from '../config/configure';
import { DatabaseModule } from '../database/database.module';

import { addEntities, addSubscribers } from '../database/helpers';

import * as entities from './entities';
import { defaultContentConfig } from './helpers';
import * as repositories from './repositories';
import * as services from './services';
import { PostService } from './services/post.service';
import { SanitizeService } from './services/sanitize.service';
import * as subscribers from './subscribers';
import { ContentConfig } from './types';

@Module({})
export class ContentModule {
  static async forRoot(configure: Configure) {
    const config = await configure.get<ContentConfig>(
      'content',
      defaultContentConfig,
    );
    const providers: ModuleMetadata['providers'] = [
      ...Object.values(services),
      ...(await addSubscribers(configure, Object.values(subscribers))),
      // 其它提供者
    ];
    if (config.htmlEnabled) providers.push(SanitizeService);
    if (config.searchType === 'meilli') providers.push(services.SearchService);
    return {
      module: ContentModule,
      imports: [
        addEntities(configure, Object.values(entities)),
        DatabaseModule.forRepository(Object.values(repositories)),
      ],
      providers,
      exports: [
        ...Object.values(services),
        PostService,
        DatabaseModule.forRepository(Object.values(repositories)),
      ],
    };
  }
}
