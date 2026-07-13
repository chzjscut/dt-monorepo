import { input, confirm, select, checkbox, rawlist, expand, editor } from '@inquirer/prompts';
import chalk from 'chalk';

const customTheme = {
  prefix: '→',
  spinner: {
    interval: 100,
    frames: ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']
  },
  style: {
    answer: chalk.green,
    question: chalk.bold,
    error: chalk.red,
    help: chalk.gray
  },
  border: true,
  borderColor: 'cyan'
}

let cliConfig = {};
const projectName = await input({
  message: 'Enter your name',
  default: 'dt-app',
  theme: {
    prefix: chalk.green('>'),
    style: {
      primary: chalk.cyan
    }
  }
});
console.log(projectName)
cliConfig.projectName = projectName;
const isOk = await confirm({ message: '继续执行？', default: true, theme: customTheme });
console.log(isOk)
const framework = await select({
  message: '选择框架',
  choices: [
    { name: 'Vue', value: 'vue', description: '渐进式框架' },
    { name: 'React', value: 'react', description: 'UI 库' },
    { name: 'Angular', value: 'angular', description: '完整框架' },
  ]
});
console.log(framework)
cliConfig.framework = framework;
const availableTypes = await checkbox({
  message: '选择开发模式',
  choices: [
    { name: 'js', value: 'js' },
    'ts',
    'jsx',
    'tsx',
  ],
  validate: (answer) => {
    if(answer.length === 0) return '至少选择一个';
    return true;
  }
});

cliConfig.availableTypes = availableTypes;
const action = await expand({
  message: '确认操作？',
  choices: [
    { key: 'y', name: '是', value: 'yes' },
    { key: 'n', name: '否', value: 'no' },
    { key: 'q', name: '退出', value: 'quit' }
  ],
  default: 'y'
});
cliConfig.action = action;
const operation = await rawlist({
  message: '选择操作',
  choices: ['安装', '启动服务', '卸载']
});
cliConfig.operation = operation;
const content = await editor({
  message: '输入内容',
  // postfix: '.md',
  default: '这是一个project'
});
cliConfig.content = content;


console.log(cliConfig)
