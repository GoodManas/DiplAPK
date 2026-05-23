const { existsSync } = require('fs');
const { spawnSync } = require('child_process');
const path = require('path');

const root = path.join(__dirname, '..');
const apk = path.join(
  root,
  'android',
  'app',
  'build',
  'outputs',
  'apk',
  'release',
  'app-release.apk',
);

function findAdb() {
  const sdkRoots = [
    process.env.ANDROID_HOME,
    process.env.ANDROID_SDK_ROOT,
    process.platform === 'win32'
      ? path.join(process.env.LOCALAPPDATA || '', 'Android', 'Sdk')
      : path.join(process.env.HOME || '', 'Library', 'Android', 'sdk'),
  ].filter(Boolean);

  for (const sdk of sdkRoots) {
    const adb = path.join(sdk, 'platform-tools', process.platform === 'win32' ? 'adb.exe' : 'adb');
    if (existsSync(adb)) return adb;
  }
  return null;
}

if (!existsSync(apk)) {
  console.error('\nAPK not found. Run first: npm run build:apk\n');
  console.error(apk);
  process.exit(1);
}

const adb = findAdb();
if (!adb) {
  console.error('\nadb not found. Install Android Studio Platform-Tools.\n');
  console.error('Or copy APK to phone and open it manually:\n', apk);
  process.exit(1);
}

console.log('APK:', apk);
console.log('ADB:', adb);
console.log('\nConnect phone (USB debugging ON). Listing devices...\n');

spawnSync(adb, ['devices'], { stdio: 'inherit' });

console.log('\nInstalling...\n');
const install = spawnSync(adb, ['install', '-r', apk], { stdio: 'inherit' });

if (install.status !== 0) {
  console.error('\nInstall failed. Try manual copy of APK to phone.\n');
  process.exit(install.status ?? 1);
}

console.log('\nInstalled successfully.\n');
