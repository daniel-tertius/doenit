#!/bin/bash

# Widget Debugging Script for Doenit App
# This script helps debug the home screen widget complete button functionality

echo "=== Widget Debugging Script ==="
echo "This script will help you debug the widget complete button issue."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if device is connected
echo -e "${BLUE}Step 1: Checking device connection...${NC}"
if ! adb devices | grep -q "device$"; then
    echo -e "${YELLOW}⚠️  No Android device detected.${NC}"
    echo "Choose option 2 for device setup help, or connect a device and restart the script."
    echo ""
else
    echo -e "${GREEN}✅ Device connected${NC}"
    echo ""
fi

# Function to get package name
get_package_name() {
    local package_name=$(grep -r "applicationId" android/app/build.gradle | sed 's/.*"\(.*\)".*/\1/' | head -1)
    if [ -z "$package_name" ]; then
        package_name="doenit.app"  # fallback
    fi
    echo $package_name
}

PACKAGE_NAME=$(get_package_name)
echo -e "${BLUE}Package name: ${PACKAGE_NAME}${NC}"
echo ""

# Function to install and run debug version
install_debug() {
    echo -e "${BLUE}Step 2: Installing debug APK...${NC}"
    ./android/gradlew -p android assembleDebug
    adb install -r android/app/build/outputs/apk/debug/app-debug.apk
    echo -e "${GREEN}✅ Debug APK installed${NC}"
    echo ""
}

# Function to clear logs and start monitoring
start_log_monitoring() {
    echo -e "${BLUE}Step 3: Starting log monitoring...${NC}"
    echo -e "${YELLOW}This will show widget-related logs. Press Ctrl+C to stop.${NC}"
    echo ""
    adb logcat -c  # clear logs
    adb logcat | grep -E "(TaskWidget|doenit\.app)"
}

# Function to simulate widget actions
simulate_widget_actions() {
    echo -e "${BLUE}Step 4: Simulating widget actions...${NC}"
    echo ""
    
    echo -e "${YELLOW}Testing COMPLETE_TASK action...${NC}"
    adb shell am broadcast -a "doenit.app.COMPLETE_TASK" -e "task_id" "test_task_123" -n "${PACKAGE_NAME}/doenit.app.TaskWidgetProvider"
    
    echo ""
    echo -e "${YELLOW}Testing ADD_TASK action...${NC}"
    adb shell am broadcast -a "doenit.app.ADD_TASK" -n "${PACKAGE_NAME}/doenit.app.TaskWidgetProvider"
    
    echo ""
    echo -e "${GREEN}✅ Test broadcasts sent${NC}"
}

# Function to force widget update
force_widget_update() {
    echo -e "${BLUE}Step 5: Forcing widget update...${NC}"
    adb shell am broadcast -a "android.appwidget.action.APPWIDGET_UPDATE" -n "${PACKAGE_NAME}/doenit.app.TaskWidgetProvider"
    echo -e "${GREEN}✅ Widget update broadcast sent${NC}"
    echo ""
}

# Function to check widget configuration
check_widget_config() {
    echo -e "${BLUE}Step 6: Checking widget configuration...${NC}"
    echo ""
    
    echo "Checking AndroidManifest.xml for widget receiver..."
    if grep -q "TaskWidgetProvider" android/app/src/main/AndroidManifest.xml; then
        echo -e "${GREEN}✅ Widget receiver found in manifest${NC}"
    else
        echo -e "${RED}❌ Widget receiver NOT found in manifest${NC}"
    fi
    
    echo ""
    echo "Checking for widget layout files..."
    if [ -f "android/app/src/main/res/layout/task_widget.xml" ]; then
        echo -e "${GREEN}✅ Main widget layout found${NC}"
    else
        echo -e "${RED}❌ Main widget layout NOT found${NC}"
    fi
    
    if [ -f "android/app/src/main/res/layout/task_widget_item.xml" ]; then
        echo -e "${GREEN}✅ Widget item layout found${NC}"
    else
        echo -e "${RED}❌ Widget item layout NOT found${NC}"
    fi
    
    echo ""
    echo "Checking for drawable resources..."
    if [ -f "android/app/src/main/res/drawable/ic_box.xml" ]; then
        echo -e "${GREEN}✅ Complete button icon found${NC}"
    else
        echo -e "${RED}❌ Complete button icon NOT found${NC}"
    fi
}

# Function to show SharedPreferences data
show_storage_data() {
    echo -e "${BLUE}Step 7: Checking app storage data...${NC}"
    echo ""
    
    echo "Tasks in CapacitorStorage:"
    adb shell run-as $PACKAGE_NAME cat /data/data/$PACKAGE_NAME/shared_prefs/CapacitorStorage.xml 2>/dev/null | grep -A5 -B5 "Item" || echo "Could not read storage (app might not be installed or no data)"
}

# Function to help setup device connection
setup_device_connection() {
    echo -e "${BLUE}=== Device Connection Setup ===${NC}"
    echo ""
    echo -e "${YELLOW}To connect your Android device for testing:${NC}"
    echo ""
    echo "📱 Physical Device (USB):"
    echo "1. Enable Developer Options:"
    echo "   - Go to Settings > About phone"
    echo "   - Tap 'Build number' 7 times"
    echo "2. Enable USB Debugging:"
    echo "   - Go to Settings > Developer options"
    echo "   - Enable 'USB debugging'"
    echo "   - Enable 'Install via USB' (if available)"
    echo "3. Connect via USB cable"
    echo "4. Allow USB debugging when prompted"
    echo ""
    echo "🖥️  Android Emulator:"
    echo "1. Open Android Studio"
    echo "2. Go to Tools > AVD Manager"
    echo "3. Create/Start a virtual device"
    echo ""
    echo "🔄 Wireless Debugging (Android 11+):"
    echo "1. Enable 'Wireless debugging' in Developer options"
    echo "2. Connect to same WiFi network"
    echo "3. Use 'adb connect' with device IP"
    echo ""
    
    read -p "Press Enter to check device connection again..."
    echo ""
    
    echo -e "${BLUE}Checking device connection...${NC}"
    adb devices -l
    echo ""
    
    if adb devices | grep -q "device$"; then
        echo -e "${GREEN}✅ Device found! You can now use the debugging options.${NC}"
    else
        echo -e "${RED}❌ No device connected. Please follow the steps above and try again.${NC}"
    fi
}

# Function to deploy app to device
deploy_app() {
    echo -e "${BLUE}=== Deploying App to Device ===${NC}"
    echo ""
    
    # Check if device is connected
    if ! adb devices | grep -q "device$"; then
        echo -e "${RED}❌ No device connected. Please connect a device first.${NC}"
        return 1
    fi
    
    echo -e "${YELLOW}Building and installing debug APK...${NC}"

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

    # echo "Building APK..."
    # if npm run app; then
    #     echo -e "${GREEN}✅ Svelte App built successfully${NC}"
    # else
    #     echo -e "${RED}❌ Svelte App build failed. Check the output above for errors.${NC}"
    #     return 1
    # fi

    # Build the debug APK
    echo "Building APK..."
    if ./android/gradlew -p android assembleDebug; then
        echo -e "${GREEN}✅ Build successful${NC}"
    else
        echo -e "${RED}❌ Build failed. Check the output above for errors.${NC}"
        return 1
    fi
    
    # Install the APK
    echo ""
    echo "Installing APK to device..."
    if adb install -r android/app/build/outputs/apk/debug/app-debug.apk; then
        echo -e "${GREEN}✅ App installed successfully${NC}"
        echo ""
        echo -e "${YELLOW}The app has been updated on your device!${NC}"
        echo "You can now:"
        echo "- Launch the app from your device"
        echo "- Add/update the widget on your home screen"
        echo "- Test the complete button functionality"
    else
        echo -e "${RED}❌ Installation failed. Make sure USB debugging is enabled.${NC}"
        return 1
    fi
}

# Main menu
show_menu() {
    echo ""
    echo -e "${BLUE}=== Debugging Options ===${NC}"
    echo "1. Deploy app to device (Build & Install)"
    echo "2. Setup device connection help"
    echo "3. Monitor widget logs (real-time)"
    echo "4. Simulate widget button presses"
    echo "5. Force widget update"
    echo "6. Check widget configuration"
    echo "7. Check app storage data"
    echo "8. Run complete diagnostic"
    echo "9. Exit"
    echo ""
    read -p "Choose an option (1-9): " choice
    
    case $choice in
        1)
            deploy_app
            show_menu
            ;;
        2)
            setup_device_connection
            show_menu
            ;;
        3)
            start_log_monitoring
            show_menu
            ;;
        4)
            simulate_widget_actions
            show_menu
            ;;
        5)
            force_widget_update
            show_menu
            ;;
        6)
            check_widget_config
            show_menu
            ;;
        7)
            show_storage_data
            show_menu
            ;;
        8)
            install_debug
            check_widget_config
            force_widget_update
            echo ""
            echo -e "${YELLOW}Now add the widget to your home screen and try clicking the complete button.${NC}"
            echo -e "${YELLOW}Then run option 3 to monitor logs in real-time.${NC}"
            show_menu
            ;;
        9)
            echo -e "${GREEN}Goodbye!${NC}"
            exit 0
            ;;
        *)
            echo -e "${RED}Invalid option. Please try again.${NC}"
            show_menu
            ;;
    esac
}

# Start the debugging process
show_menu
