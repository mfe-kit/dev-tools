#!/usr/bin/env zx

import { $, cd, chalk, question } from 'zx';
import { basename } from 'node:path';
import { chdir } from 'node:process';

// Constants
const MFE_NAME_REGEXP = /^([a-zA-Z][a-zA-Z0-9-]*|[a-z][a-z0-9]*-[a-z0-9-]*)$/;
const GIT_REPO_URL_REGEXP =
  /^(https:\/\/|git@)([\w.-]+)(\/|:)[\w.-]+\/[\w.-]+(\.git)?$/;
const WELCOME_MESSAGE = `
╔══════════════════════════════════════╗
║                                      ║
║       Welcome to the MFE-KIT         ║
║                                      ║
╚══════════════════════════════════════╝
`;

// Variables
let mfeName = '';
let repoUrl = '';

process.stdin.on('data', (data) => {
  if (data.toString() === '\u0003') {
    console.log(
      '\n' + chalk.redBright('Installer aborted by user. Exiting...'),
    );
    process.exit(1);
  }
});

console.clear();
console.log(chalk.cyanBright.bold(WELCOME_MESSAGE));

// Greetings
console.log(chalk.yellow('This is the MFE installer. 🚀'));
console.log(
  chalk.yellow(
    'Please follow the next steps to create your new Micro Frontend.',
  ),
);
console.log(
  chalk.yellow(
    'You will be guided through scaffolding, repository assignment, and configuration.',
  ),
);
console.log('\n');

// Step 1: MFE name
while (!mfeName) {
  console.log(chalk.blueBright('Step 1: Choose your MFE name.'));
  console.log(
    '  ' +
      chalk.gray('(e.g. ') +
      chalk.green('my-mfe-component') +
      chalk.gray(')'),
  );

  const input = await question('Enter MFE name(tag): ');

  if (MFE_NAME_REGEXP.test(input)) {
    mfeName = input;
  } else {
    console.log(
      chalk.redBright('Invalid name! MFE name should be valid tag name.\n'),
    );
  }
}
console.log('\n');

// Step 2 Link repository
while (repoUrl === '') {
  console.log(chalk.blueBright('Step 2: Link MFE to your Git repository.'));
  console.log(
    '  ' + chalk.magentaBright('Important: the repository must be empty'),
  );
  console.log(
    '  ' +
      chalk.gray('(e.g. ') +
      chalk.green('https://github.com/username/repo.git') +
      chalk.gray(', or press Enter to skip)'),
  );

  repoUrl = (await question('Enter repository URL: ')).trim();

  if (!repoUrl) {
    console.log(chalk.yellow('Skipping repository linking.'));
    break;
  }

  if (GIT_REPO_URL_REGEXP.test(repoUrl)) {
    console.log(
      chalk.green(`Repository ${repoUrl} will be linked to your MFE.`),
    );
  } else {
    repoUrl = '';
    console.log(
      chalk.redBright(
        'Invalid Git URL! Please enter a valid HTTPS or SSH repository URL.\n',
      ),
    );
  }
}
