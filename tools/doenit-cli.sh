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
    echo -e "${CYAN}╠═══════════════════════════════════════╦══════════════════════════╣${NC}"
    echo -e "${CYAN}║ ${YELLOW}1.${NC} Web Ontwikkeling (npm run dev) ${CYAN}║ ${YELLOW}5.${NC} Bou en Installeer (dev)   ${CYAN}║${NC}"
    echo -e "${CYAN}║ ${YELLOW}2.${NC} Firebase Functions Bestuur     ${CYAN}║ ${YELLOW}6.${NC} Toestel Bestuur           ${CYAN}║${NC}"
    echo -e "${CYAN}║ ${YELLOW}3.${NC} Installeer Dependencies        ${CYAN}║ ${YELLOW}7.${NC} Widget Debug              ${CYAN}║${NC}"
    echo -e "${CYAN}║ ${YELLOW}4.${NC} Bou App (produksie)            ${CYAN}║ ${YELLOW}8.${NC} App Logs Kyk              ${CYAN}║${NC}"
    echo -e "${CYAN}╚═════════════════════════════════════╩════════════════════════════╝${NC}"
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
    echo -e "${PURPLE}🏗️ Bou produksie app...${NC}"
    
    # Load production environment
    if [ ! -f ".env.production" ]; then
        echo -e "${RED}❌ .env.production file nie gevind nie${NC}"
        echo -e "${YELLOW}Eerste keer produksie bou? Volg hierdie stappe:${NC}"
        echo "1. Skep produksie keystore: ${CYAN}./tools/generate-production-keystore.sh${NC}"
        echo "2. Redigeer .env.production met jou produksie waardes"
        echo "3. Skep Firebase app vir produksie (doenit.app)"
        echo "4. Laai af google-services.json vir produksie app"
        return 1
    fi
    
    # Check if production keystore exists
    if [ ! -f "android/app-production.keystore" ]; then
        echo -e "${RED}❌ Produksie keystore nie gevind nie${NC}"
        echo "Skep dit met: ${CYAN}./tools/generate-production-keystore.sh${NC}"
        return 1
    fi
    
    echo -e "${BLUE}📦 Installeer dependencies...${NC}"
    npm install || {
        echo -e "${RED}❌ npm install failed${NC}"
        return 1
    }
    
    echo -e "${BLUE}🏗️ Bou Svelte vir produksie...${NC}"
    NODE_ENV=production npm run build:prod || {
        echo -e "${RED}❌ Production build failed${NC}"
        return 1
    }
    
    echo -e "${BLUE}🔄 Sync Capacitor...${NC}"
    NODE_ENV=production npx cap sync || {
        echo -e "${RED}❌ Capacitor sync failed${NC}"
        return 1
    }
    
    echo -e "${BLUE}📱 Bou Android produksie AAB...${NC}"
    NODE_ENV=production npx cap build android || {
        echo -e "${RED}❌ Android build failed${NC}"
        return 1
    }
    
    echo -e "${BLUE}📁 Kopieer uitset lêers...${NC}"
    mkdir -p app-output
    rm -f app-output/doenit.aab app-output/doenit.apk
    
    # Copy AAB file
    if [ -f "android/app/build/outputs/bundle/release/app-release-signed.aab" ]; then
        cp android/app/build/outputs/bundle/release/app-release-signed.aab app-output/doenit.aab
        echo -e "${GREEN}✅ doenit.aab geskep${NC}"
    fi
    
    # Copy APK file if it exists
    if [ -f "android/app/build/outputs/apk/release/app-release-signed.apk" ]; then
        cp android/app/build/outputs/apk/release/app-release-signed.apk app-output/doenit.apk
        echo -e "${GREEN}✅ doenit.apk geskep${NC}"
    fi
    
    echo -e "${GREEN}🎉 Produksie app gebou! Lêers in app-output/ gids.${NC}"
    echo -e "${CYAN}📤 Laai doenit.aab op na Google Play Console${NC}"
}

# Bou en installeer ontwikkeling weergawe
build_and_install() {
    if ! check_device_connected; then
        return 1
    fi
    
    echo -e "${BLUE}🏗️ Bou en installeer ontwikkeling weergawe...${NC}"
    
    echo -e "${BLUE}📦 Installeer dependencies...${NC}"
    npm install || {
        echo -e "${RED}❌ npm install failed${NC}"
        return 1
    }
    
    echo -e "${BLUE}🏗️ Bou Svelte vir ontwikkeling...${NC}"
    NODE_ENV=development npm run build:dev || {
        echo -e "${RED}❌ Development build failed${NC}"
        return 1
    }
    
    echo -e "${BLUE}🔄 Sync Capacitor...${NC}"
    NODE_ENV=development npx cap sync || {
        echo -e "${RED}❌ Capacitor sync failed${NC}"
        return 1
    }
    
    echo -e "${BLUE}📱 Bou Android debug APK...${NC}"
    cd android
    if ./gradlew assembleDebug; then
        echo -e "${GREEN}✅ Debug APK gebou${NC}"
        
        # Find the APK file
        APK_PATH="app/build/outputs/apk/debug/app-debug.apk"
        if [ -f "$APK_PATH" ]; then
            echo -e "${BLUE}📲 Installeer op toestel...${NC}"
            if adb install -r "$APK_PATH"; then
                echo -e "${GREEN}✅ Ontwikkeling app geïnstalleer${NC}"
                echo -e "${CYAN}App ID: doenit.app.dev${NC}"
                echo -e "${CYAN}App Naam: Doenit Dev${NC}"
            else
                echo -e "${RED}❌ Installasie gefaal${NC}"
                cd ..
                return 1
            fi
        else
            echo -e "${RED}❌ APK lêer nie gevind nie: $APK_PATH${NC}"
            cd ..
            return 1
        fi
    else
        echo -e "${RED}❌ APK bou gefaal${NC}"
        cd ..
        return 1
    fi
    cd ..
    
    # Copy to app-output for convenience
    mkdir -p app-output
    cp android/app/build/outputs/apk/debug/app-debug.apk app-output/doenit-dev.apk 2>/dev/null || true
    echo -e "${GREEN}🎉 Ontwikkeling app gereed!${NC}"
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
        
        # Check for production app
        if adb shell pm list packages | grep -q "doenit.app$"; then
            echo -e "${GREEN}✅ Produksie app geïnstalleer (doenit.app)${NC}"
            adb shell dumpsys package "doenit.app" | grep versionName || echo "Kan nie versie kry nie"
        else
            echo -e "${RED}❌ Produksie app nie geïnstalleer nie${NC}"
        fi
        
        # Check for development app
        if adb shell pm list packages | grep -q "doenit.app.dev"; then
            echo -e "${GREEN}✅ Ontwikkeling app geïnstalleer (doenit.app.dev)${NC}"
            adb shell dumpsys package "doenit.app.dev" | grep versionName || echo "Kan nie versie kry nie"
        else
            echo -e "${RED}❌ Ontwikkeling app nie geïnstalleer nie${NC}"
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
    read -p "Kies opsie: " widget_choice
    
    case $widget_choice in
        1)
            echo -e "${BLUE}Toets widget aksies...${NC}"
            adb shell am broadcast -a "doenit.app.COMPLETE_TASK" -e "task_id" "test_task_123" -n "${PACKAGE_NAME}/doenit.app.TaskWidgetProvider"
            ;;
    esac
}

# App logs kyk
view_app_logs() {
    if ! check_device_connected; then
        return
    fi
    
    echo -e "${BLUE}📋 Kyk app logs (Ctrl+C om te stop)...${NC}"
    echo -e "${CYAN}Monitoring beide produksie (doenit.app) en ontwikkeling (doenit.app.dev) apps${NC}"
    adb logcat -c
    adb logcat | grep "Doenit"
}

# Begin CLI
clear
main
