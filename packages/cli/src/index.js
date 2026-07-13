#!/usr/bin/env node
import { Command } from 'commander';

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join, relative } from 'node:path';
import { execSync, spawnSync } from 'node:child_process';

const program = new Command();

// program.name('dt').description('dt monorepo engineering cli').version('0.0.1');
// console.log(1, program.opts())

// program.option('-n, --name <name>', 'name of the new project');

// program.parse(process.argv);
// console.log(2, program.opts())

////////////////////////////////////////////////////////////////////////////////////////
function findRepoRoot(start = process.cwd()) {
  let current = start;
  while(current !== dirname(current)) {
    if(existsSync(join(current, 'pnpm-workspace.yaml'))) return current;
    current = dirname(current);
  }
  throw new Error('Cannot find pnpm-workspace.yaml. Please run ccs inside the monorepo.');
}

function displayPath(path, root) {
  return relative(root, path).replace(/\\/g, '/');
}

function replaceAll(value, replacements) {
  return Object.entries(replacements).reduce((next, [key, replacement]) => next.split(key).join(replacement), value);
}

function writeTextFile(path, content) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content, 'utf8');
}

function copyTemplate(templateDir, destDir, replacements = {}) {
  // console.log(templateDir, destDir)
  if(!existsSync(templateDir)) throw new Error(`Template not found: ${templateDir}`);
  const visit = (from, to) => {
    const files = readdirSync(from);
    // console.log('files:', files)
    for(const entry of files) {
      const source = join(from, entry);
      const targetName = replaceAll(entry, replacements);
      const target = join(to, targetName);
      // console.log(123, source, target)
      // 确保目标目录存在
      if(statSync(source).isDirectory()) {
        mkdirSync(dirname(target), { recursive: true });
        visit(source, target);
      } else {
        writeTextFile(target, replaceAll(readFileSync(source, 'utf8'), replacements));
      }
    }
  }
  visit(templateDir, destDir);
}

function insertBeforeMarker(file, marker, code) {
  const content = readFileSync(file, 'utf8');
  writeFileSync(file, content.replace(marker, `${code}\n${marker}`));
}

program.name('dt').description('ccs monorepo engineering cli').version('0.0.1');

const create = program.command('create');

create
  .command('module')
  .argument('<name>', 'name of the new module')
  .action(name => {
    console.log('create module:', name);

    const root = findRepoRoot();
    const target = join(root, 'apps', name);
    // console.log(displayPath(target, root));
    if(existsSync(target)) throw new Error(`${displayPath(target, root)} already exists`);

    copyTemplate(resolve(root, 'templates', 'module-vue'), target, {
      __MODULE_NAME__: name
    });
    // console.log('__filename:', fileURLToPath(import.meta.url))
    // console.log('__dirname:', dirname(fileURLToPath(import.meta.url)))
  })

create
  .command('page')
  .description('create a new page')
  .argument('<name>', 'name of the new page')
  .option('-m, --module <module>', 'module of the new page')
  .action((name, options) => {
    // console.log('create page:', name, options);

    const root = findRepoRoot();
    const targetModule = join(root, 'apps', options.module);
    if(!existsSync(targetModule)) throw new Error(`module not found: ${displayPath(targetModule, root)}`);
    const target = join(targetModule, 'src', 'views', name);
    if(existsSync(target)) {
      console.log('\x1b[33m%s\x1B[0m', `Page ${name} already exists in ${options.module}, skipped.`);
      return;
    }
    
    copyTemplate(join(root, 'templates', 'page'), target, {
      __PAGE_PASCAL__: name
    });

    insertBeforeMarker(
      join(targetModule, 'src', 'router', 'index.ts'),
      '// dt-cli:route',
      `    {
      path: '/${name}',
      name: '${name}',
      component: () => import('../views/${name}Page.vue')
    },`
    );
  })

program.parse(process.argv);

// console.log(process.cwd(), 2, program.opts())
