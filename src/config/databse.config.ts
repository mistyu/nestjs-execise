import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const database = (): TypeOrmModuleOptions => ({
  charset: 'utf8mb4',
  logging: ['error'],
  type: 'mysql',
  host: 'mistyu.com',
  port: 3306,
  username: 'root',
  password: '123456',
  database: 'nestjs_exercise',
  synchronize: true,
  autoLoadEntities: true,
});
