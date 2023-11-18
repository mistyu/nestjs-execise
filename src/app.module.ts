import { Module } from '@nestjs/common';

import { database } from './config';
import { ContentModule } from './modules/content/content.module';
import { CoreModule } from './modules/core/core.module';
import { DatabaseModule } from './modules/database/database.module';

@Module({
  imports: [
    DatabaseModule.forRoot(database),
    ContentModule,
    CoreModule.forRoot(),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
