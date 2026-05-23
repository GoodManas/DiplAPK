@echo off
setlocal EnableExtensions
cd /d "%~dp0"

set "APK=%~dp0android\app\build\outputs\apk\release\app-release.apk"
set "ADB=%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe"

if not exist "%APK%" (
  echo ERROR: APK not found. Run: npm run build:apk
  echo %APK%
  pause
  exit /b 1
)

if not exist "%ADB%" (
  if not "%ANDROID_HOME%"=="" set "ADB=%ANDROID_HOME%\platform-tools\adb.exe"
)

if not exist "%ADB%" (
  echo ERROR: adb.exe not found. Install Android SDK Platform-Tools.
  echo Or copy APK to phone and open it manually.
  pause
  exit /b 1
)

echo APK: %APK%
echo ADB: %ADB%
echo.
echo Connect phone via USB. Enable USB debugging on the phone.
echo.

"%ADB%" devices
echo.
"%ADB%" install -r "%APK%"
if errorlevel 1 (
  echo.
  echo ERROR: install failed. Check USB cable, driver, USB debugging.
  echo Or copy APK to phone and install manually.
  pause
  exit /b 1
)

echo.
echo Done.
pause
endlocal
