#!/usr/bin/env node
import { Command } from 'commander';
import { input, confirm, select, checkbox, rawlist, expand, editor } from '@inquirer/prompts';
import chalk from 'chalk';

const program = new Command();

program.name('dt-cli').description('结合commander和inquirer的cli工具示例').version('1.0.0');

const create = program.command('create');

create
  .description('创建一个项目')
  .action(async () => {
    const projectName = await input({
      message: '请输入项目名称',
      default: 'my-project',
    });

    const framework = await select({
      message: '请选择框架',
      choices: [
        { name: 'Vue', value: 'vue' },
        { name: 'React', value: 'react' },
        { name: 'Angular', value: 'angular' },
        { name: 'Svelte', value: 'svelte' },
      ]
    });

    const isTS = await confirm({ message: '是否需要使用TypeScript？', default: false });

    console.log('\n配置已确认：');
    console.log(`项目名称：${projectName}`);
    console.log(`所选框架：${framework}`);
    console.log(`TypeScript：${isTS ? '启用' : '禁用'}`);
    console.log(`\n正在生成项目...`);

    // todo
    // generate project
  })


program.parse(process.argv);
