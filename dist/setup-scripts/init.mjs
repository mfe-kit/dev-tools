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
await setMfeName();
await setMfeRepo();
await scaffoldingMfe();
await initRepoAndInstallPackages();
await configureMfe();
await initialCommit();
await pressAnyKey();
success();

// Steps
async function greetings() {
  const latestVersion = await getLatestTag(
    'https://github.com/mfe-kit/dev-tools.git',
  );
  const WELCOME_MESSAGE = `
  ╔══════════════════════════════════════╗
  ║                                      ║
  ║       ${chalk.bgCyan.whiteBright(' Welcome to the MFE-KIT ')}       ║
  ║                                      ║
  ╚══════════════════════════════════════╝
  `;
  console.clear();
  console.log(chalk.cyanBright.bold(WELCOME_MESSAGE));
  console.log(
    chalk.yellow.magenta(
      '  🚀 This is the MFE installer' + chalk.green(`(${latestVersion}).🚀\n`),
    ),
  );
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

async function setMfeName() {
  console.clear();
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
      console.clear();
      console.log(
        chalk.redBright(
          '❌ Invalid name! MFE name should be valid tag name.\n\n',
        ),
      );
      showMfeNameSpec();
    }
  }
  console.log();
}

async function setMfeRepo() {
  console.clear();
  while (repoUrl === '') {
    console.log(chalk.blueBright('🔗 Link MFE to your Git repository.'));
    console.log(
      '  ' +
        chalk.magentaBright(
          'Important: the repository must be empty, and you must have write access (via your Git account or SSH keys)',
        ),
    );
    console.log(
      '  ' +
        chalk.gray('(e.g. ') +
        chalk.green(
          'https://github.com/username/repo.git or git@github.com:username/repo.git ',
        ) +
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
      console.clear();
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
  await infoWrapper(
    'Getting latest version...',
    '⬇️',
    async () => (latestTag = await getLatestTag(TEMPLATE_REPO_URL)),
  );
  console.log(`🏷️ Latest version: ${chalk.green(latestTag)}`);
  console.log(`✨ Creating a new MFE in ${chalk.green(appPath)}`);
  await $`git clone --depth 1 --branch ${latestTag} ${TEMPLATE_REPO_URL} ${mfeName}`.quiet();

  console.log(`📂 Changing current work dir to ${chalk.green(mfeName)}/`);
  chdir(appPath);
  cd(appPath);
  await $`rm -rf .git`.quiet();
  console.log();
}

function showMfeNameSpec() {
  console.log(chalk.yellow('Key Naming Requirements for Custom Elements: \n'));
  console.log(
    chalk.magenta('Hyphen Inclusion: ') +
      chalk.grey(
        'Custom element names must contain at least one hyphen (U+002D HYPHEN-MINUS).',
      ),
  );
  console.log(
    chalk.magenta('Lowercase Start: ') +
      chalk.grey('The name must begin with an ASCII lowercase letter (a-z).'),
  );
  console.log(
    chalk.magenta('No Uppercase Letters: ') +
      chalk.grey('The name must not contain any ASCII uppercase letters.'),
  );
  console.log(
    chalk.magenta('Allowed Characters: ') +
      chalk.grey(
        'Valid characters include ASCII lowercase letters (a-z), digits (0-9) and hyphens (-)',
      ),
  );
  console.log(
    chalk.magenta('Disallowed Characters: ') +
      chalk.grey(
        'Certain characters are explicitly prohibited, including symbols like =, @, and $.',
      ),
  );
  console.log(
    chalk.magenta('Reserved Names:  ') +
      chalk.grey(
        'annotation-xml, color-profile, font-face, font-face-src, font-face-uri, font-face-format, font-face-name, and missing-glyph \n',
      ),
  );
}

async function initRepoAndInstallPackages() {
  await infoWrapper('Installing packages...', '📦', async () => {
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
      './src/frontend/snippets/spinner.ts',
      './src/frontend/snippets/cat-image.ts',
      './src/frontend/styles/styles.scss',
      './test/frontend/__snapshots__/index.spec.ts.snap',
      './test/frontend/snippets/__snapshots__/spinner.spec.ts.snap',
      './test/frontend/snippets/__snapshots__/cat-image.spec.ts.snap',
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
      './test/frontend/index.spec.ts',
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

  await infoWrapper('Updating application version...', '🔖', () => {
    const packageJsonPath = path.resolve(process.cwd(), 'package.json');
    const raw = fs.readFileSync(packageJsonPath, 'utf8');
    const data = JSON.parse(raw);

    data.version = '0.0.1';

    fs.writeFileSync(
      packageJsonPath,
      JSON.stringify(data, null, 2) + '\n',
      'utf8',
    );
  });

  await infoWrapper(
    'Running initial tests...',
    '🧪',
    async () => await $`npm run test`.quiet(),
  );

  await infoWrapper('Building project...', '🏗️', async () => {
    await $`rm -rf dist`.quiet();
    await $`npm run build:be`.quiet();
    await $`npm run build:fe`.quiet();
  });
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
  console.clear();
  console.log(
    `${chalk.bgGreen.whiteBright(' 🎉 MFE has been successfully created 🎉 \n')}`,
  );
  console.log(
    ' 🏁' +
      ` Created ${chalk.greenBright(mfeName)} at ${chalk.greenBright(appPath)} \n`,
  );
  console.log(
    chalk.magentaBright('Important: use proper node version') +
      chalk.gray('(from .nvmrc file)') +
      chalk.magentaBright(' or run command: ') +
      chalk.green('nvm use'),
  );
  console.log(
    chalk.blueBright(`Inside the directory, you can run several commands:`),
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
  try {
    await callback();
  } catch (e) {
    console.error(`🛑 Error during execution: ${text} \n`);
    console.error(e);
  }
  process.stdout.write(`\r${icon} ${text} ✅   \n`);
}

async function getLatestTag(repoUrl) {
  const { stdout } =
    await $`git ls-remote --tags --sort="v:refname" ${repoUrl}`;
  const result = stdout
    .trim()
    .split('\n')
    .map((line) => line.split('/').pop())
    .filter((tag) => !tag.endsWith('^{}'))
    .pop();
  return result;
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
