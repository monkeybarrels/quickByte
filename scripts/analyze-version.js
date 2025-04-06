#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

const packagePath = process.argv[2];
if (!packagePath) {
  console.error('Please provide a package path');
  process.exit(1);
}

// Get the last tag for this package
const packageJson = require(path.join(process.cwd(), packagePath, 'package.json'));
const packageName = packageJson.name;
const currentVersion = packageJson.version;

// Get commits since last tag
const commits = execSync(`git log --pretty=format:"%s" ${currentVersion}..HEAD -- ${packagePath}`).toString().split('\n');

// Analyze commit messages
let major = 0;
let minor = 0;
let patch = 0;

commits.forEach(commit => {
  if (commit.includes('BREAKING CHANGE') || commit.startsWith('feat!') || commit.startsWith('fix!')) {
    major++;
  } else if (commit.startsWith('feat')) {
    minor++;
  } else if (commit.startsWith('fix') || commit.startsWith('perf') || commit.startsWith('refactor')) {
    patch++;
  }
});

// Suggest version bump
console.log(`\nAnalyzing commits for ${packageName} since version ${currentVersion}:`);
console.log(`Found ${commits.length} commits:`);
console.log(`- Breaking changes: ${major}`);
console.log(`- New features: ${minor}`);
console.log(`- Bug fixes/improvements: ${patch}\n`);

if (major > 0) {
  console.log('Suggested: MAJOR version bump (breaking changes detected)');
  console.log(`Run: npm run release:${packageName.split('-')[1]}:major`);
} else if (minor > 0) {
  console.log('Suggested: MINOR version bump (new features detected)');
  console.log(`Run: npm run release:${packageName.split('-')[1]}:minor`);
} else if (patch > 0) {
  console.log('Suggested: PATCH version bump (bug fixes detected)');
  console.log(`Run: npm run release:${packageName.split('-')[1]}:patch`);
} else {
  console.log('No significant changes detected. No version bump needed.');
} 