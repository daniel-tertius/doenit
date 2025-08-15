#!/bin/bash

# Environment handling
ENVIRONMENT=${1:-"dev"}  # Default to dev if no argument provided
if [ "$ENVIRONMENT" = "prod" ]; then
    ENV_FILE=".env"
    OUTPUT_SUFFIX=""
else
    ENV_FILE=".env.development"
    OUTPUT_SUFFIX="-dev"
fi

echo "Building for environment: $ENVIRONMENT"
echo "Using environment file: $ENV_FILE"

# Load environment variables
if [ -f "$ENV_FILE" ]; then
    export $(cat $ENV_FILE | grep -v '^#' | xargs)
    echo "Loaded environment variables from $ENV_FILE"
else
    echo "Warning: $ENV_FILE not found, using default .env"
fi

# Check if git is installed
if ! command -v git &>/dev/null; then
    echo -e "${red}[ERROR] git is not installed. Please install git and try again.${clear}"
    exit 1
fi

repo_root=$(git rev-parse --show-toplevel)
cd $repo_root

# Source the file containing the functions
source ./tools/functions.sh
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

echo -e "${echo_prefix} Building Svelte code for $ENVIRONMENT environment…"
if [ "$ENVIRONMENT" = "prod" ]; then
    npm run build || {
        echo -e "${red}[ERROR] 'npm run build' failed${clear}"
        exit 1
    }
else
    NODE_ENV=development npm run build:dev || {
        echo -e "${red}[ERROR] 'npm run build:dev' failed${clear}"
        exit 1
    }
fi

echo -e "${echo_prefix} Synchronising static svelte files with app assets"
npx cap sync || {
    echo -e "${red}[ERROR] 'npx cap sync' failed${clear}"
    exit 1
}

# ----------------------------------------------------------------
# STEP 4: GENERATE DEBUG APK FILE
# ----------------------------------------------------------------
# echo -e "${echo_prefix} Building debug android APK file"
# cd android
# ./gradlew
# cd - >/dev/null

# echo -e "${echo_prefix} Copying 'doenit-debug.apk' to ./app-output"

# mkdir -p app-output
# rm -f app-output/doenit-debug.apk
# cp android/app/build/outputs/apk/release/app-release-unsigned.apk app-output/doenit-debug.apk

# ----------------------------------------------------------------
# STEP 5: GENERATE SIGNED RELEASE APK FILE
# ----------------------------------------------------------------
echo -e "${echo_prefix} Building signed android APK file"
npx cap build android --androidreleasetype "APK" --signing-type "apksigner" || {
    echo -e "${red}[ERROR] 'npx cap build android' failed${clear}"
    exit 1
}

echo -e "${echo_prefix} Copying 'doenit${OUTPUT_SUFFIX}.apk' to ./app-output"

mkdir -p app-output
rm -f "app-output/doenit${OUTPUT_SUFFIX}.apk"
cp android/app/build/outputs/apk/release/app-release-signed.apk "app-output/doenit${OUTPUT_SUFFIX}.apk"

# ----------------------------------------------------------------
# STEP 6: GENERATE SIGNED RELEASE AAB FILE
# ----------------------------------------------------------------
echo -e "${echo_prefix} Building signed android AAB file"
npx cap build android || {
    echo -e "${red}[ERROR] 'npx cap build android' failed${clear}"
    exit 1
}

echo -e "${echo_prefix} Copying 'doenit${OUTPUT_SUFFIX}.aab' to ./app-output"

mkdir -p app-output
rm -f "app-output/doenit${OUTPUT_SUFFIX}.aab"
cp android/app/build/outputs/bundle/release/app-release-signed.aab "app-output/doenit${OUTPUT_SUFFIX}.aab"

echo -e "${green}Script successfully executed for $ENVIRONMENT environment!${clear}"
echo -e "${green}Generated files:${clear}"
echo -e "${green}  - app-output/doenit${OUTPUT_SUFFIX}.apk${clear}"
echo -e "${green}  - app-output/doenit${OUTPUT_SUFFIX}.aab${clear}"
