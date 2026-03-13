import * as esbuild from 'esbuild';
import { readdirSync, statSync, existsSync } from 'fs';
import { join, relative } from 'path';

const isWatch = process.argv.includes('--watch');

function findHandlers(dir) {
  const handlers = [];
  if (!existsSync(dir)) return handlers;
  const entries = readdirSync(dir);
  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      handlers.push(...findHandlers(fullPath));
    } else if (entry.endsWith('.ts') && !entry.includes('.d.ts')) {
      handlers.push(fullPath);
    }
  }
  return handlers;
}

const srcDir = new URL('./src', import.meta.url).pathname;
const handlers = findHandlers(srcDir).filter(f => !f.includes('/shared/'));

const buildOptions = {
  entryPoints: handlers,
  bundle: true,
  platform: 'node',
  target: 'node20',
  format: 'cjs',
  outbase: 'src',
  outdir: 'dist',
  entryNames: '[dir]/[name]/index',
  external: [],
  sourcemap: true,
  minify: false,
};

if (isWatch) {
  const ctx = await esbuild.context(buildOptions);
  await ctx.watch();
  console.log('Watching for changes...');
} else {
  await esbuild.build(buildOptions);
  console.log('Build complete');
}
