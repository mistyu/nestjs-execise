import { createDbConfig } from '@/modules/database/helpers';

export const database = createDbConfig((configure) => ({
  common: {
    synchronize: true,
  },
  connections: [
    {
      // 以下为mysql配置
      type: 'mysql',
      host: '127.0.0.1',
      port: 3306,
      username: 'root',
      password: 'nestjs-exercise',
      database: 'nestjs_exercise',
    },
    // {
    // 以下为sqlite配置
    // type: 'better-sqlite3',
    // database: resolve(__dirname, '../../database.db'),
    // },
  ],
}));
