#!/bin/bash

# Check if git is installed
if ! command -v git &>/dev/null; then
    echo -e "${red}[ERROR] git is not installed. Please install git and try again.${clear}"
    exit 1
fi

# repo_root=$(git rev-parse --show-toplevel)
# cd $repo_root

# Source the file containing the functions
source ./scripts/functions.sh
echo_prefix="${yellow}[${magenta}SCRIPT${yellow}]${clear}"

if [ ! -f android/app.keystore ]; then
    echo -e "${red}Keystore file not found in 'android' directory.${clear}"
    exit 1
fi

# ----------------------------------------------------------------
# STEP 1: DETERMINE WHICH ENVIRONMENT
# ----------------------------------------------------------------
env=''
if [ "$1" = "dev" ] || [ "$1" = "staging" ] || [ "$1" = "prod" ]; then
    env=$1
else
    echo -e "For which environment would you like to run? Select only ${cyan}one${clear} (<space> to select; <enter> to confirm)"
    OPTIONS_STRING="dev;staging;prod"
    IFS=';' read -r -a OPTIONS_VALUES <<<"$OPTIONS_STRING"
    prompt_for_multiselect SELECTED "$OPTIONS_STRING"
    for i in "${!SELECTED[@]}"; do
        if [ "${SELECTED[$i]}" == "true" ]; then
            env="${OPTIONS_VALUES[$i]}"
            break
        fi
    done
fi

# ----------------------------------------------------------------
# STEP 2: PRINT OUT WHICH ENV (OR EXIT IF INVALID).
# ----------------------------------------------------------------
if [ "${env}" = "dev" ]; then
    echo -e "${echo_prefix} Generating signed ${yellow}release APK${clear} and ${yellow}debug APK${clear} for ${blue}Dev${clear}..."
elif [ "${env}" = "staging" ]; then
    echo -e "${echo_prefix} Generating signed ${yellow}release APK${clear} and ${yellow}AAB${clear} for ${blue}Staging${clear}..."
elif [ "${env}" = "prod" ]; then
    echo -e "${echo_prefix} Generating signed ${yellow}release APK${clear} and ${yellow}AAB${clear} for ${blue}Prod${clear}..."
else
    echo -e "${echo_prefix} Unknown environment. Exiting..."
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
# if [ "${env}" = "dev" ]; then
#     echo -e "${echo_prefix} Building debug android APK file"
#     cd android
#     ./gradlew # assemble${env^}Debug # ${env^} capitalize first letter
#     cd - >/dev/null

#     echo -e "${echo_prefix} Copying 'unaffi-${env}-debug.apk' to ./app-output"

#     mkdir -p app-output
#     rm -f app-output/unaffi-${env}-debug.apk
#     cp android/app/build/outputs/apk/${env}/debug/app-${env}-debug.apk app-output/unaffi-${env}-debug.apk
# fi

# ----------------------------------------------------------------
# STEP 5: GENERATE SIGNED RELEASE APK FILE
# ----------------------------------------------------------------
echo -e "${echo_prefix} Building signed android APK file"

npx cap build android --keystorepath "app.keystore" --keystorepass "123456" --keystorealias "Tertius" --androidreleasetype "APK" --signing-type "apksigner" || {
    echo -e "${red}[ERROR] 'npx cap build android' failed${clear}"
    exit 1
}

echo -e "${echo_prefix} Copying 'unaffi-${env}.apk' to ./app-output"

mkdir -p app-output
rm -f app-output/unaffi-${env}.apk
cp android/app/build/outputs/apk/${env}/release/app-${env}-release-signed.apk app-output/unaffi-${env}.apk

# ----------------------------------------------------------------
# STEP 6: GENERATE SIGNED RELEASE AAB FILE
# ----------------------------------------------------------------
if [ "$1" = "staging" ] || [ "$1" = "prod" ]; then
    echo -e "${echo_prefix} Building signed android AAB file"
    npx cap build android --androidreleasetype "AAB" --signing-type "jarsigner" --flavor $env || {
        echo -e "${red}[ERROR] 'npx cap build android --flavor $env' failed${clear}"
        exit 1
    }

    echo -e "${echo_prefix} Copying 'unaffi-${env}.aab' to ./app-output"

    mkdir -p app-output
    rm -f app-output/unaffi-${env}.aab
    cp android/app/build/outputs/bundle/${env}Release/app-${env}-release-signed.aab app-output/unaffi-${env}.aab
fi

echo -e "${green}Script successfully executed!${clear}"
