/* eslint-disable import/no-extraneous-dependencies */
import { SpawnOptions as NodeSpawnOptions } from 'child_process';

import { Configuration as NestCLIConfig } from '@nestjs/cli/lib/configuration';
import type { SpawnOptions as BunSpawnOptions } from 'bun';
import ts from 'typescript';

export type StartCommandArguments = {
  nestConfig?: string;
  tsConfig?: string;
  entry?: string;
  prod?: boolean;
  typescript?: boolean;
  watch?: boolean;
  debug?: boolean | string;
  restart?: boolean;
};

export interface CLIConfig {
  options: {
    ts: ts.CompilerOptions;
    nest: NestCLIConfig;
  };
  paths: Record<'cwd' | 'dist' | 'src' | 'js' | 'ts' | 'bun' | 'nest', string>;
  subprocess: {
    bun: BunSpawnOptions.OptionsObject;
    node: NodeSpawnOptions;
  };
}

export type Pm2Option = Pick<StartCommandArguments, 'typescript' | 'watch'> & {
  command: string;
};

export type BuildCommandArguments = Pick<
  StartCommandArguments,
  'tsConfig' | 'nestConfig'
> & {
  watch?: string;
  preserveWatchOutput?: boolean;
};
