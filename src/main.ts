import { NestFactory } from '@nestjs/core';

import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
    {
      cors: true,
      logger: ['error', 'warn', 'log'],
    },
  );
  // 指定 url 前缀
  app.setGlobalPrefix('api');
  // 允许跨域
  app.enableCors();
  await app.listen(3000, '0.0.0.0' /* 允许外网访问 */);
  // 01:56:18
}
bootstrap();
