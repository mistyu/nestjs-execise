import { Module } from '@nestjs/common';

import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';

import { content, database, meilli } from './config';
import { ContentModule } from './modules/content/content.module';
import { CoreModule } from './modules/core/core.module';
import { AppIntercepter, AppPipe } from './modules/core/providers';
import { AppFilter } from './modules/core/providers/app.filter';
import { DatabaseModule } from './modules/database/database.module';
import { MeilliModule } from './modules/meilisearch/melli.module';

@Module({
  imports: [
    DatabaseModule.forRoot(database),
    ContentModule.forRoot(content),
    CoreModule.forRoot(),
    ContentModule.forRoot(content),
    MeilliModule.forRoot(meilli),
  ],
  controllers: [],
  providers: [
    {
      provide: APP_PIPE,
      useValue: new AppPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
        forbidUnknownValues: true,
        validationError: { target: false },
      }),
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: AppIntercepter,
    },
    {
      provide: APP_FILTER,
      useClass: AppFilter,
    },
  ],
})
export class AppModule {}
