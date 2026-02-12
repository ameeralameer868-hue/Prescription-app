@echo off
chcp 65001 >nul

:: MediCare Pro Build Script for Windows
:: This script builds the Android APK for the Prescription App

echo ======================================
echo   MediCare Pro - Build Script
echo ======================================
echo.

:: Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo Error: Node.js is not installed
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

:: Check if Cordova is installed
cordova --version >nul 2>&1
if errorlevel 1 (
    echo Cordova not found. Installing...
    call npm install -g cordova
)

:: Install dependencies
echo Installing dependencies...
call npm install

:: Check if Android platform exists
if not exist "platforms\android" (
    echo Adding Android platform...
    call cordova platform add android
)

:: Build APK
echo.
echo Building Android APK...
echo.

if "%1"=="release" (
    echo Building RELEASE version...
    call cordova build android --release
) else (
    echo Building DEBUG version...
    call cordova build android
)

:: Check if build was successful
if %errorlevel% equ 0 (
    echo.
    echo ======================================
    echo   Build Successful!
    echo ======================================
    echo.
    
    if "%1"=="release" (
        echo APK Location:
        echo platforms\android\app\build\outputs\apk\release\app-release-unsigned.apk
    ) else (
        echo APK Location:
        echo platforms\android\app\build\outputs\apk\debug\app-debug.apk
    )
    echo.
) else (
    echo.
    echo ======================================
    echo   Build Failed!
    echo ======================================
    echo.
    pause
    exit /b 1
)

pause
