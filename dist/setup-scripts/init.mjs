#!/usr/bin/env zx
import { $, cd, chalk, question } from 'zx';
import path from 'path';
import fs from 'fs';
import { chdir } from 'node:process';

// Constants
const REPLACE_PACKAGE_NAME = '@mfe-kit/template';
const REPLACE_TAG_NAME = 'mfe-kit-template';
const REPLACE_CLASS_NAME = 'MfeKitTemplate';

const TEMPLATE_REPO_URL = 'https://github.com/mfe-kit/template.git';
const MFE_NAME_REGEXP = /^[a-z][a-z0-9]*-[a-z0-9]+(?:-[a-z0-9]+)*$/;
const GIT_REPO_URL_REGEXP =
  /^(https:\/\/|git@)([\w.-]+)(\/|:)[\w.-]+\/[\w.-]+(\.git)?$/;

// Variables
let mfeName = '';
let mfeClassName = '';
let repoUrl = '';
let appPath = '';

process.stdin.on('data', (data) => {
  if (data.toString() === '\u0003') {
    console.log(
      '\n' + chalk.redBright('🛑 Installer aborted by user. Exiting...'),
    );
    process.exit(1);
  }
});

// Main flow
await greetings();
await setMfeData();
await scaffoldingMfe();
await initRepoAndInstallPackages();
await configureMfe();
await initialCommit();
await pressAnyKey();
success();

// Steps
async function greetings() {
  const WELCOME_MESSAGE = `
  ╔══════════════════════════════════════╗
  ║                                      ║
  ║       ${chalk.bgCyan.whiteBright(' Welcome to the MFE-KIT ')}       ║
  ║                                      ║
  ╚══════════════════════════════════════╝
  `;
  console.clear();
  console.log(chalk.cyanBright.bold(WELCOME_MESSAGE));
  console.log(chalk.yellow.bold('  🚀 This is the MFE installer. 🚀 '));
  console.log(
    chalk.yellow.bold(
      '  Please follow the next steps to create your new Micro Frontend.',
    ),
  );
  console.log(
    chalk.yellow.bold(
      '  You will be guided through scaffolding, repository assignment, and configuration.',
    ),
  );
  await pressAnyKey();
}

async function setMfeData() {
  console.clear();
  await setMfeName();
  await setMfeRepo();
}

async function setMfeName() {
  while (!mfeName) {
    console.log(chalk.blueBright('🔤 Choose your MFE name.'));
    console.log(
      '  ' +
        chalk.gray('(e.g. ') +
        chalk.green('my-mfe-component') +
        chalk.gray(')'),
    );

    const input = await question('Enter MFE name(tag): ');

    if (MFE_NAME_REGEXP.test(input)) {
      mfeName = input;
      mfeClassName = mfeName
        .split('-')
        .map((el) => el.charAt(0).toUpperCase() + el.slice(1).toLowerCase())
        .join('');
    } else {
      console.log(
        chalk.redBright(
          '❌ Invalid name! MFE name should be valid tag name.\n',
        ),
      );
    }
  }
  console.log();
}

async function setMfeRepo() {
  while (repoUrl === '') {
    console.log(chalk.blueBright('🔗 Link MFE to your Git repository.'));
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
      console.log(chalk.yellow('⏭️ Skipping repository linking.'));
      break;
    }

    if (GIT_REPO_URL_REGEXP.test(repoUrl)) {
      console.log(
        chalk.green(`✅ Repository ${repoUrl} will be linked to your MFE.`),
      );
    } else {
      repoUrl = '';
      console.log(
        chalk.redBright(
          '❌ Invalid Git URL! Please enter a valid HTTPS or SSH repository URL.\n',
        ),
      );
    }
  }
}

async function scaffoldingMfe() {
  let latestTag = '';
  console.clear();
  appPath = path.join(process.cwd(), mfeName);
  await infoWrapper('Getting latest version...', '⬇️ ', async () => {
    const { stdout } =
      await $`git ls-remote --tags --sort="v:refname" ${TEMPLATE_REPO_URL}`;
    const tags = stdout
      .trim()
      .split('\n')
      .map((line) => line.split('/').pop())
      .filter((tag) => !tag.endsWith('^{}'));
    latestTag = tags.pop();
  });
  console.log(`🏷️  Latest tag: ${chalk.green(latestTag)}`);
  console.log(`📦 Creating a new MFE in ${chalk.green(appPath)}`);
  await $`git clone --depth 1 --branch ${latestTag} ${TEMPLATE_REPO_URL} ${mfeName}`.quiet();

  console.log(`📂 Changing current work dir to ${chalk.green(mfeName)}/`);
  chdir(appPath);
  cd(appPath);
  await $`rm -rf .git`.quiet();
  console.log();
}

async function initRepoAndInstallPackages() {
  await infoWrapper('Installing packages...', '📤', async () => {
    await $`rm -rf package-lock.json`.quiet();
    await $`npm install`.quiet();
  });

  if (repoUrl) {
    await infoWrapper('Initializing git repository...', '⚙️ ', async () => {
      await $`git init`.quiet();
      await $`git remote add origin ${repoUrl}`.quiet();
    });

    await infoWrapper('Replacing repository names...', '🔧', async () => {
      const repoReplace = ['./src/manifest.yaml', './package.json'];
      repoReplace.forEach((file) =>
        updateFile(file, TEMPLATE_REPO_URL, repoUrl),
      );
    });
  }
}

async function configureMfe() {
  await infoWrapper('Replacing tag-names names...', '🔧', async () => {
    const tagReplace = [
      './src/frontend/index.ts',
      './test/__snapshots__/index.spec.ts.snap',
      './src/manifest.yaml',
      './src/.env.example',
      './src/.env.production',
    ];
    tagReplace.forEach((file) => updateFile(file, REPLACE_TAG_NAME, mfeName));
    updateFile('./package.json', REPLACE_PACKAGE_NAME, mfeName);
  });

  await infoWrapper('Replacing class names ...', '🔧', async () => {
    const nameReplace = [
      './src/frontend/index.ts',
      './test/index.spec.ts',
      './src/manifest.yaml',
    ];
    nameReplace.forEach((file) =>
      updateFile(file, REPLACE_CLASS_NAME, mfeClassName),
    );
  });

  await infoWrapper(
    'Generating environment file...',
    '📝',
    async () => await $`mv ./src/.env.example ./src/.env`,
  );
  await infoWrapper(
    'Running initial tests...',
    '🧪',
    async () => await $`npm run test`.quiet(),
  );
  await infoWrapper(
    'Building project...',
    '🏗️ ',
    async () => await $`npm run build`.quiet(),
  );
}

async function initialCommit() {
  if (repoUrl) {
    await infoWrapper(
      'Creating initial commit...',
      '📝',
      async () => await $`git add . && git commit -m "Init the project"`,
    );
    await infoWrapper(
      'Pushing to the main brach...',
      '📤',
      async () => await $`git push -u origin main --force`,
    );
  }
}

function success() {
  const SUCCESS_MESSAGE = `
  ╔═════════════════════════════════════════════════════════╗
  ║                                                         ║
  ║                                                         ║
  ║       ${chalk.bgGreen.whiteBright(' 🎉 MFE has been successfully created 🎉 ')}         ║
  ║                                                         ║
  ║                                                         ║
  ╚═════════════════════════════════════════════════════════╝
  `;
  console.clear();
  console.log(chalk.greenBright.bold(SUCCESS_MESSAGE));
  console.log('🏁 ' + chalk.greenBright(` Created ${mfeName} at ${appPath}`));
  console.log();
  console.log(
    chalk.magentaBright('Important: use proper node version') +
      chalk.gray('(from .nvmrc file)') +
      chalk.magentaBright(' or run command: ') +
      chalk.green('nvm use'),
  );
  console.log();
  console.log(
    chalk.blueBright('Inside that directory, you can run several commands:'),
  );
  console.log(
    chalk.gray(`
        ${chalk.green('npm run dev')}
          Starts the development server.

        ${chalk.green('npm run build')}
          Bundles the app into static files for production.

        ${chalk.green('npm run test')}
          Starts the test runner.
    `),
  );
}

function pressAnyKey() {
  return new Promise((resolve) => {
    process.stdin.setRawMode(true);
    process.stdin.resume();
    console.log('\n');
    console.log(chalk.gray('  Press any key to continue...'));
    process.stdin.once('data', () => {
      process.stdin.setRawMode(false);
      process.stdin.pause();
      resolve();
    });
  });
}

async function infoWrapper(text, icon, callback) {
  process.stdout.write(`${icon} ${text}`);
  await callback();
  process.stdout.write(`\r${icon} ${text} ✅   \n`);
}

function updateFile(file, search, replace) {
  const filepath = path.resolve(process.cwd(), file);
  let content = fs.readFileSync(filepath, 'utf8');

  if (Array.isArray(search)) {
    for (const [s, r] of search) {
      content = content.split(s).join(r);
    }
  } else {
    content = content.split(search).join(replace);
  }

  fs.writeFileSync(filepath, content, 'utf8');
}
