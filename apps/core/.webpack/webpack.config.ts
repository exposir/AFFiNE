import { createConfiguration, rootPath } from './config.js';
import { merge } from 'webpack-merge';
import { resolve } from 'node:path';
import type { BuildFlags } from '@affine/cli/config';
import { getRuntimeConfig } from './runtime-config.js';

export default async function (cli_env: any, _: any) {
  const flags: BuildFlags = JSON.parse(
    Buffer.from(cli_env.flags, 'hex').toString('utf-8')
  );
  console.log('build flags', flags);
  const runtimeConfig = getRuntimeConfig(flags);
  console.log('runtime config', runtimeConfig);
  const config = createConfiguration(flags, runtimeConfig);
  return merge(config, {
    entry: {
      'polyfill-ses': {
        asyncChunks: false,
        import: resolve(rootPath, 'src/polyfill/ses.ts'),
      },
      plugin: {
        asyncChunks: true,
        dependOn: ['polyfill-ses'],
        import: resolve(rootPath, 'src/bootstrap/register-plugins.ts'),
      },
      index: {
        asyncChunks: false,
        dependOn: ['polyfill-ses', 'plugin'],
        import: resolve(rootPath, 'src/index.tsx'),
      },
    },
  });
}
