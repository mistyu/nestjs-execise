import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const database = (): TypeOrmModuleOptions => ({
  charset: 'utf8mb4',
  logging: ['error'],
  type: 'mysql',
  host: '127.0.0.1',
  port: 3306,
  username: 'root',
  password: 'nestjs',
  database: 'nestjs-exercise',
  synchronize: true,
  autoLoadEntities: true,
});
