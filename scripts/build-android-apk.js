/**
 * Сборка release APK с автопоиском Android SDK (Windows: %LOCALAPPDATA%\Android\Sdk).
 */
const { existsSync, writeFileSync } = require('fs');
const { spawnSync } = require('child_process');
const path = require('path');

const root = path.join(__dirname, '..');
const androidDir = path.join(root, 'android');

function findSdk() {
  const candidates = [
    process.env.ANDROID_HOME,
    process.env.ANDROID_SDK_ROOT,
    process.platform === 'win32'
      ? path.join(process.env.LOCALAPPDATA || '', 'Android', 'Sdk')
      : path.join(process.env.HOME || '', 'Library', 'Android', 'sdk'),
    '/usr/local/share/android-sdk',
  ].filter(Boolean);

  for (const dir of candidates) {
    if (existsSync(path.join(dir, 'platform-tools'))) {
      return dir;
    }
  }
  return null;
}

const sdk = findSdk();
if (!sdk) {
  console.error(
    '\n[Ошибка] Android SDK не найден.\n' +
      'Установите Android Studio и SDK, либо задайте ANDROID_HOME.\n' +
      'Обычный путь: %LOCALAPPDATA%\\Android\\Sdk\n',
  );
  process.exit(1);
}

process.env.ANDROID_HOME = sdk;
process.env.ANDROID_SDK_ROOT = sdk;

const sdkDirProp = sdk.replace(/\\/g, '/');
writeFileSync(
  path.join(androidDir, 'local.properties'),
  `sdk.dir=${sdkDirProp}\n`,
  'utf8',
);

console.log(`Android SDK: ${sdk}`);
console.log('Сборка release APK (assembleRelease)...\n');

const gradlew = process.platform === 'win32' ? 'gradlew.bat' : 'gradlew';
const result = spawnSync(gradlew, ['assembleRelease'], {
  cwd: androidDir,
  stdio: 'inherit',
  env: process.env,
  shell: process.platform === 'win32',
});

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

const apk = path.join(
  androidDir,
  'app',
  'build',
  'outputs',
  'apk',
  'release',
  'app-release.apk',
);

if (!existsSync(apk)) {
  console.error(`\n[Ошибка] APK не найден: ${apk}`);
  process.exit(1);
}

console.log(`\nГотово:\n${apk}\n`);
