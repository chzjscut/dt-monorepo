/**
 * 在 monorepo 项目根目录下执行 build 命令时，会对所有子项目打包，并把打包产物放在
 * 根目录下的dist文件夹下（每个子项目对应dist下一个文件夹）
 */

import { spawnSync } from "node:child_process";
import { readdirSync, readFileSync, existsSync, rmSync, mkdirSync } from "node:fs";
import { join } from "node:path";


const root = process.cwd();

const appsDir = join(root, 'apps');
const distWebDir = join(root, 'dist', 'web');

// { name: 'ccs-framework', outDir: distWebDir, base: '/', scripts: {} }
const builds = [];
for(const dir of readdirSync(appsDir)) {
  const packageFile = join(appsDir, dir, 'package.json');
  if(!existsSync(packageFile)) continue;
  const pkg = JSON.parse(readFileSync(packageFile, 'utf8'));
  builds.push({
    name: pkg.name ?? dir,
    outDir: join(distWebDir, dir),
    // base: `/${dir}`,
    base: `./`,
    scripts: pkg.scripts ?? {}
  });
}

rmSync(distWebDir, { recursive: true, force: true });
mkdirSync(distWebDir, { recursive: true });

for(const build of builds) {
  console.log(`\n[dt] build ${build.name} -> ${build.outDir}`);
  const result = spawnSync('pnpm', ['--filter', build.name, 'build'], {
    cwd: root,
    stdio: 'inherit',
    shell: process.platform === 'win32',
    env: {
      ...process.env,
      CCS_WEB_BASE: build.base,
      CCS_WEB_OUT_DIR: build.outDir,
    }
  });

  if (result.status !== 0) process.exit(result.status ?? 1);
}
