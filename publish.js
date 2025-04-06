const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Function to read package.json
function readPackageJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

// Function to write package.json
function writePackageJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// Function to publish a package
function publishPackage(packagePath) {
  console.log(`Publishing package at ${packagePath}...`);
  try {
    execSync(`cd ${packagePath} && npm publish --access public`, { stdio: 'inherit' });
    console.log(`Successfully published package at ${packagePath}`);
  } catch (error) {
    console.error(`Failed to publish package at ${packagePath}:`, error.message);
  }
}

// Main function
async function main() {
  // Get the package to publish from command line arguments
  const packageToPublish = process.argv[2];
  
  if (!packageToPublish) {
    console.error('Please specify which package to publish: core or pipelines');
    process.exit(1);
  }
  
  if (packageToPublish === 'core') {
    // Publish core package
    const corePackagePath = path.join(__dirname, 'packages', '@quickbyte', 'core');
    publishPackage(corePackagePath);
  } else if (packageToPublish === 'pipelines') {
    // Publish pipelines package
    const pipelinesPackagePath = path.join(__dirname, 'packages', '@quickbyte', 'pipelines');
    publishPackage(pipelinesPackagePath);
  } else {
    console.error('Invalid package name. Use "core" or "pipelines"');
    process.exit(1);
  }
}

main().catch(console.error); 