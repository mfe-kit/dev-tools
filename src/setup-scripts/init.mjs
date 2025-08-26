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
const WELCOME_MESSAGE = `
╔══════════════════════════════════════╗
║                                      ║
║       Welcome to the MFE-KIT         ║
║                                      ║
╚══════════════════════════════════════╝
`;

// Variables
let mfeName = '';
let mfeClassName = '';
let repoUrl = '';

process.stdin.on('data', (data) => {
  if (data.toString() === '\u0003') {
    console.log(
      '\n' + chalk.redBright('🛑 Installer aborted by user. Exiting...'),
    );
    process.exit(1);
  }
});

console.clear();
console.log(chalk.cyanBright.bold(WELCOME_MESSAGE));

// Greetings
console.log(chalk.yellow('🚀 This is the MFE installer. 🚀 '));
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

// Set MFE name
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
      chalk.redBright('❌ Invalid name! MFE name should be valid tag name.\n'),
    );
  }
}
console.log();

// Link repository
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
console.log();

// Creating and configuring MFE
const appPath = path.join(process.cwd(), mfeName);
console.log('⬇️ Getting latest version...');
const { stdout } =
  await $`git ls-remote --tags --sort="v:refname" ${TEMPLATE_REPO_URL}`;
const tags = stdout
  .trim()
  .split('\n')
  .map((line) => line.split('/').pop())
  .filter((tag) => !tag.endsWith('^{}'));
const latestTag = tags.pop();
console.log(`🏷️  Latest tag: ${chalk.green(latestTag)}`);
console.log(`📦 Creating a new MFE in ${chalk.green(appPath)}`);
await $`git clone --depth 1 --branch ${latestTag} ${TEMPLATE_REPO_URL} ${mfeName}`.quiet();

console.log(`📂 Changing current work dir to ${chalk.green(mfeName)}/`);
chdir(appPath);
cd(appPath);
await $`rm -rf .git`.quiet();
console.log();

if (repoUrl) {
  process.stdout.write('⚙️ Initializing git repository...');
  await $`git init`.quiet();
  await $`git remote add origin ${repoUrl}`.quiet();
  process.stdout.write('\r⚙️ Initializing git repository... ✅   \n');
}

process.stdout.write('📥 Installing packages...');
await $`rm -rf package-lock.json`.quiet();
await $`npm install`.quiet();
process.stdout.write('\r📥 Installing packages... ✅   \n');

if (repoUrl) {
  process.stdout.write('🔧 Replacing repository names...');
  const repoReplace = ['./src/manifest.yaml', './package.json'];
  repoReplace.forEach((file) => updateFile(file, TEMPLATE_REPO_URL, repoUrl));
  process.stdout.write('\r🔧 Replacing repository names... ✅   \n');
}

process.stdout.write('🔧 Replacing tag-names names...');
const tagReplace = [
  './src/frontend/index.ts',
  './test/__snapshots__/index.spec.ts.snap',
  './src/manifest.yaml',
  './src/.env.example',
  './src/.env.production',
];
tagReplace.forEach((file) => updateFile(file, REPLACE_TAG_NAME, mfeName));
updateFile('./package.json', REPLACE_PACKAGE_NAME, mfeName);
process.stdout.write('\r🔧 Replacing tag-names names... ✅   \n');

process.stdout.write('🔧 Replacing class names ...');
const nameReplace = [
  './src/frontend/index.ts',
  './test/index.spec.ts',
  './src/manifest.yaml',
];
nameReplace.forEach((file) =>
  updateFile(file, REPLACE_CLASS_NAME, mfeClassName),
);
process.stdout.write('\r🔧 Replacing class names ... ✅   \n');

process.stdout.write('📝 Generating environment file...');
await $`mv ./src/.env.example ./src/.env`;
process.stdout.write('\r📝 Generating environment file...   \n');

process.stdout.write('🧪 Running initial tests...');
await $`npm run test`.quiet();
process.stdout.write('\r🧪 Running initial tests...✅   \n');

process.stdout.write('🏗️ Building project...');
await $`npm run build`.quiet();
process.stdout.write('\r🏗️ Building project...✅   \n');

if (repoUrl) {
  process.stdout.write('📝 Creating initial commit...');
  await $`git add . && git commit -m "Init the project"`;
  process.stdout.write('\r📝 Creating initial commit...✅   \n');

  process.stdout.write('📤 Pushing to the main brach...');
  await $`git push -u origin main --force"`;
  process.stdout.write('\r📤 Pushing to the main brach...✅   \n');
}
console.log('\n');

console.log('🎉 Success!');
console.log(`🏁 Created ${mfeName} at ${appPath}`);

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
