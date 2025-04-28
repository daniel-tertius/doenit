#!/bin/bash

# Check if git is installed
if ! command -v git &>/dev/null; then
    echo -e "${red}[ERROR] git is not installed. Please install git and try again.${clear}"
    exit 1
fi

repo_root=$(git rev-parse --show-toplevel)
cd $repo_root

# Source the file containing the functions
source ./scripts/functions.sh
echo_prefix="${yellow}[${magenta}SCRIPT${yellow}]${clear}"

if [ ! -f android/app.keystore ]; then
    echo -e "${red}Keystore file not found in 'android' directory.${clear}"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &>/dev/null; then
    echo -e "${red}[ERROR] npm is not installed. Please install npm and try again.${clear}"
    exit 1
fi

# ----------------------------------------------------------------
# STEP 3: DO PREPARATIONS: npm i, npm run build, npx cap sync…
# ----------------------------------------------------------------
echo -e "${echo_prefix} Checking that dependencies are up to date"
npm i || {
    echo -e "${red}[ERROR] 'npm i' failed${clear}"
    exit 1
}

echo -e "${echo_prefix} Building Svelte code…  ${clear}"
npm run build || {
    echo -e "${red}[ERROR] 'npm run build' failed${clear}"
    exit 1
}

echo -e "${echo_prefix} Synchronising static svelte files with app assets"
npx cap sync || {
    echo -e "${red}[ERROR] 'npx cap sync' failed${clear}"
    exit 1
}

# ----------------------------------------------------------------
# STEP 4: GENERATE DEBUG APK FILE
# ----------------------------------------------------------------
echo -e "${echo_prefix} Building debug android APK file"
cd android
./gradlew
cd - >/dev/null

echo -e "${echo_prefix} Copying 'debug.apk' to ./app-output"

mkdir -p app-output
rm -f app-output/debug.apk
cp android/app/build/outputs/apk/debug/app-debug.apk app-output/debug.apk

# ----------------------------------------------------------------
# STEP 5: GENERATE SIGNED RELEASE APK FILE
# ----------------------------------------------------------------
echo -e "${echo_prefix} Building signed android APK file"

npx cap build android --keystorepath "app.keystore" --keystorepass "123456" --keystorealias "Tertius" --androidreleasetype "APK" --signing-type "apksigner" || {
    echo -e "${red}[ERROR] 'npx cap build android' failed${clear}"
    exit 1
}

echo -e "${echo_prefix} Copying 'taskly.apk' to ./app-output"

mkdir -p app-output
rm -f app-output/taskly.apk
cp android/app/build/outputs/apk/release/app-release-signed.apk app-output/taskly.apk

# ----------------------------------------------------------------
# STEP 6: GENERATE SIGNED RELEASE AAB FILE
# ----------------------------------------------------------------
echo -e "${echo_prefix} Building signed android AAB file"
npx cap build android --androidreleasetype "AAB" --signing-type "jarsigner" || {
    echo -e "${red}[ERROR] 'npx cap build android' failed${clear}"
    exit 1
}

echo -e "${echo_prefix} Copying 'taskly.aab' to ./app-output"

mkdir -p app-output
rm -f app-output/taskly.aab
cp android/app/build/outputs/bundle/release/app-release.aab app-output/taskly.aab

echo -e "${green}Script successfully executed!${clear}"
