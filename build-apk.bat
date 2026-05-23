@echo off
setlocal EnableExtensions
chcp 65001 >nul
cd /d "%~dp0"

echo.
echo ========================================
echo   DP — сборка Android APK (release)
echo ========================================
echo.

where node >nul 2>&1
if errorlevel 1 (
  echo [Ошибка] Node.js не найден. Установите LTS с https://nodejs.org/
  pause
  exit /b 1
)

set "SDK=%LOCALAPPDATA%\Android\Sdk"
if not exist "%SDK%\platform-tools\" (
  if not "%ANDROID_HOME%"=="" set "SDK=%ANDROID_HOME%"
)
if not exist "%SDK%\platform-tools\" (
  echo [Ошибка] Android SDK не найден.
  echo Установите Android Studio или задайте ANDROID_HOME.
  pause
  exit /b 1
)
set "ANDROID_HOME=%SDK%"
set "ANDROID_SDK_ROOT=%SDK%"
echo Android SDK: %SDK%

rem Gradle/React Native требуют ANDROID_HOME; local.properties — дополнительно
> "%~dp0android\local.properties" echo sdk.dir=%SDK:\=/% 

if not exist "node_modules\" (
  echo Установка npm-зависимостей...
  call npm install
  if errorlevel 1 (
    echo [Ошибка] npm install
    pause
    exit /b 1
  )
)

if not exist "android\gradlew.bat" (
  echo [Ошибка] Папка android\gradlew.bat не найдена.
  echo Сначала выполните: npx expo prebuild --platform android
  pause
  exit /b 1
  )

echo Сборка началась. Это может занять несколько минут...
echo.

set "ANDROID_HOME=%SDK%"
set "ANDROID_SDK_ROOT=%SDK%"
pushd android
call gradlew.bat assembleRelease
if errorlevel 1 (
  popd
  echo.
  echo [Ошибка] Сборка не удалась. Проверьте Android SDK и JDK ^(Android Studio^).
  pause
  exit /b 1
)
popd

set "APK=android\app\build\outputs\apk\release\app-release.apk"
if not exist "%APK%" (
  echo [Ошибка] APK не найден: %APK%
  pause
  exit /b 1
)

for %%A in ("%APK%") do set "APK_FULL=%%~fA"
echo.
echo ========================================
echo   Готово
echo ========================================
echo   %APK_FULL%
echo.
echo Скопируйте файл на телефон и установите.
echo Адрес сервера задаётся в приложении, не в APK.
echo.

explorer /select,"%APK_FULL%"
pause
endlocal
