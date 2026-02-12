#!/bin/bash

# MediCare Pro Build Script
# This script builds the Android APK for the Prescription App

echo "======================================"
echo "  MediCare Pro - Build Script"
echo "======================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js is not installed${NC}"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Check if Cordova is installed
if ! command -v cordova &> /dev/null; then
    echo -e "${YELLOW}Cordova not found. Installing...${NC}"
    npm install -g cordova
fi

# Install dependencies
echo -e "${YELLOW}Installing dependencies...${NC}"
npm install

# Check if Android platform exists
if [ ! -d "platforms/android" ]; then
    echo -e "${YELLOW}Adding Android platform...${NC}"
    cordova platform add android
fi

# Build APK
echo ""
echo -e "${YELLOW}Building Android APK...${NC}"
echo ""

if [ "$1" == "release" ]; then
    echo "Building RELEASE version..."
    cordova build android --release
else
    echo "Building DEBUG version..."
    cordova build android
fi

# Check if build was successful
if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}======================================${NC}"
    echo -e "${GREEN}  Build Successful!${NC}"
    echo -e "${GREEN}======================================${NC}"
    echo ""
    
    if [ "$1" == "release" ]; then
        echo "APK Location:"
        echo "platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk"
    else
        echo "APK Location:"
        echo "platforms/android/app/build/outputs/apk/debug/app-debug.apk"
    fi
    echo ""
else
    echo ""
    echo -e "${RED}======================================${NC}"
    echo -e "${RED}  Build Failed!${NC}"
    echo -e "${RED}======================================${NC}"
    echo ""
    exit 1
fi
