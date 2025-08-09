#!/bin/bash

# Doenit Development CLI Tool
# Volledige ontwikkeling hulpmiddel vir die Doenit app

echo "=== Doenit Ontwikkeling CLI ==="
echo "Jou alles-in-een ontwikkeling hulpmiddel"
echo ""

# Kleure vir uitset
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # Geen kleur

# Haal repo root
repo_root=$(git rev-parse --show-toplevel 2>/dev/null || pwd)
cd "$repo_root"

# Source helper functions
source ./tools/functions.sh 2>/dev/null || echo "Waarskuwing: functions.sh nie gevind nie"

PACKAGE_NAME="doenit.app"

# Helper function: Show invalid option error
show_invalid_option() {
    echo -e "${RED}Ongeldige opsie${NC}"
}

# Main menu
show_menu() {
    echo -e "${CYAN}╔══════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║                   DOENIT ONTWIKKELING CLI                        ║${NC}"
    echo -e "${CYAN}╠══════════════════════════════════════════════════════════════════╣${NC}"
    echo -e "${CYAN}║ ${YELLOW}1.${NC} Web Ontwikkeling (npm run dev) ${CYAN}║ ${YELLOW}5.${NC} Ontplooi na Toestel (dev) ${CYAN}║${NC}"
    echo -e "${CYAN}║ ${YELLOW}2.${NC} Firebase Functions Bestuur     ${CYAN}║ ${YELLOW}6.${NC} Toestel Bestuur           ${CYAN}║${NC}"
    echo -e "${CYAN}║ ${YELLOW}3.${NC} Installeer Dependencies        ${CYAN}║ ${YELLOW}7.${NC} Widget Debug              ${CYAN}║${NC}"
    echo -e "${CYAN}║ ${YELLOW}4.${NC} Bou AAB leêr (produksie)       ${CYAN}║ ${YELLOW}8.${NC} App Logs Kyk              ${CYAN}║${NC}"
    echo -e "${CYAN}╚══════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

# Hoof loop
main() {
    while true; do
        show_menu
        read -p "Kies 'n opsie (1-8): " choice
        echo ""
        
        case $choice in
            1) start_web_dev ;;
            2) manage_functions ;;
            3) install_deps ;;
            4) build_app ;;
            5) build_and_install ;;
            6) device_management ;;
            7) widget_debug ;;
            8) view_app_logs ;;
            *) 
                echo -e "${RED}Ongeldige opsie. Probeer weer.${NC}"
                sleep 1
                ;;
        esac
        
        echo ""
        read -p "Druk Enter om voort te gaan..."
        clear
    done
}

# Web development
start_web_dev() {
    echo -e "${BLUE}🌐 Begin web ontwikkeling server...${NC}"
    npm run dev
}

# Functions management
manage_functions() {
    echo -e "${PURPLE}🔥 Firebase Functions Bestuur${NC}"
    echo "1. Start functions emulator"
    echo "2. Deploy functions"
    echo "3. View functions logs"
    read -p "Kies opsie: " func_choice
    
    case $func_choice in
        1) run_firebase_command "serve" "Begin functions emulator" ;;
        2) run_firebase_command "deploy" "Deploy functions" ;;
        3) run_firebase_command "logs" "Kyk functions logs" ;;
        *) show_invalid_option ;;
    esac
}

# Install dependencies
install_deps() {
    echo -e "${YELLOW}📦 Installeer alle dependencies...${NC}"
    
    local dirs=("." "functions" "packages/capacitor-google-auth")
    local names=("Root" "Functions" "Google Auth plugin")
    
    for i in "${!dirs[@]}"; do
        echo -e "${BLUE}${names[i]} dependencies...${NC}"
        (cd "${dirs[i]}" && npm install) || {
            echo -e "${RED}❌ ${names[i]} dependencies failed${NC}"
            return 1
        }
    done
    
    echo -e "${GREEN}✅ Alle dependencies geïnstalleer${NC}"
}

# Helper function: Common build steps
do_build() {
    echo -e "${BLUE}🏗️ Bou app...${NC}"
    npm run build || {
        echo -e "${RED}❌ Build failed${NC}"
        return 1
    }
    npx cap sync || {
        echo -e "${RED}❌ Capacitor sync failed${NC}"
        return 1
    }
    echo -e "${GREEN}✅ App gebou${NC}"
}

# Bou app (produksie)
build_app() {
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
    # STEP 4: GENERATE SIGNED RELEASE AAB FILE
    # ----------------------------------------------------------------
    echo -e "${echo_prefix} Building signed android AAB file"
    npx cap build android || {
        echo -e "${red}[ERROR] 'npx cap build android' failed${clear}"
        exit 1
    }

    echo -e "${echo_prefix} Copying 'doenit.aab' to ./app-output"

    mkdir -p app-output
    rm -f app-output/doenit.aab
    cp android/app/build/outputs/bundle/release/app-release-signed.aab app-output/doenit.aab
}

# Bou en installeer debug APK
build_and_install() {
    if ! check_device_connected; then
        return 1
    fi
    
    echo -e "${BLUE}🏗️ Bou en installeer debug weergawe...${NC}"
    
    npm run build || {
        echo -e "${RED}❌ Build failed${NC}"
        return 1
    }
    npx cap sync || {
        echo -e "${RED}❌ Capacitor sync failed${NC}"
        return 1
    }
    echo -e "${GREEN}✅ App gebou${NC}"

    # Build the app
    npm run build || {
        echo -e "${RED}❌ Build failed${NC}"
        return 1
    }
    npx cap sync || {
        echo -e "${RED}❌ Capacitor sync failed${NC}"
        return 1
    }
    
    # Build and install debug APK
    cd android
    if ./gradlew assembleDebug; then
        echo -e "${GREEN}✅ APK gebou${NC}"
        if adb install -r app/build/outputs/apk/debug/app-debug.apk; then
            echo -e "${GREEN}✅ App geïnstalleer${NC}"
        else
            echo -e "${RED}❌ Installasie gefaal${NC}"
            return 1
        fi
    else
        echo -e "${RED}❌ APK bou gefaal${NC}"
        return 1
    fi
    cd ..
}

# Check of toestel gekoppel is
check_device_connected() {
    if ! command -v adb &> /dev/null; then
        echo -e "${RED}❌ ADB nie geïnstalleer nie${NC}"
        return 1
    fi
    
    if ! adb devices | grep -q "device$"; then
        echo -e "${YELLOW}⚠️ Geen Android toestel opgespoor nie${NC}"
        echo "Koppel 'n toestel en probeer weer"
        return 1
    fi
    
    echo -e "${GREEN}✅ Toestel gekoppel${NC}"
    return 0
}

# Helper function: Run Firebase command
run_firebase_command() {
    local command=$1
    local description=$2
    echo -e "${PURPLE}🔥 ${description}...${NC}"
    (cd functions && npm run "$command")
}

# Toestel bestuur (kombineer koppel help en status)
device_management() {
    echo -e "${CYAN}📱 Toestel Status${NC}"
    if check_device_connected; then
        echo ""
        echo -e "${BLUE}Toestel inligting:${NC}"
        adb shell getprop ro.product.model
        adb shell getprop ro.build.version.release
        echo ""
        echo -e "${BLUE}App status:${NC}"
        if adb shell pm list packages | grep -q "$PACKAGE_NAME"; then
            echo -e "${GREEN}✅ App geïnstalleer${NC}"
            adb shell dumpsys package "$PACKAGE_NAME" | grep versionName || echo "Kan nie versie kry nie"
        else
            echo -e "${RED}❌ App nie geïnstalleer nie${NC}"
        fi
    fi  
}

# Widget debug (oorspronklike funksionaliteit)
widget_debug() {
    echo -e "${YELLOW}🔧 Widget Debug Mode${NC}"
    if ! check_device_connected; then
        return
    fi
    
    echo "1. Toets widget aksies"
    echo "2. Forseer widget opdateering"
    read -p "Kies opsie: " widget_choice
    
    case $widget_choice in
        1)
            echo -e "${BLUE}Toets widget aksies...${NC}"
            adb shell am broadcast -a "doenit.app.COMPLETE_TASK" -e "task_id" "test_task_123" -n "${PACKAGE_NAME}/doenit.app.TaskWidgetProvider"
            ;;
        2)
            echo -e "${BLUE}Forseer widget opdateering...${NC}"
            adb shell am broadcast -a "android.appwidget.action.APPWIDGET_UPDATE" -n "${PACKAGE_NAME}/doenit.app.TaskWidgetProvider"
            ;;
    esac
}

# App logs kyk
view_app_logs() {
    if ! check_device_connected; then
        return
    fi
    
    echo -e "${BLUE}📋 Kyk app logs (Ctrl+C om te stop)...${NC}"
    adb logcat -c
    adb logcat | grep -E "(${PACKAGE_NAME}|doenit)"
}

# Begin CLI
clear
main
