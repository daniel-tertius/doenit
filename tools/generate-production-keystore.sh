#!/bin/bash

# Script to generate a production keystore for Google Play Store

echo "🔐 Production Keystore Generator"
echo "================================"
echo ""
echo "This script will generate a production keystore for your app."
echo "⚠️  IMPORTANT: Keep this keystore file secure! You'll need it for all future updates to your app."
echo ""

# Navigate to android directory
cd "$(dirname "$0")/../android" || exit 1

# Check if production keystore already exists
if [ -f "app-production.keystore" ]; then
    echo "❌ Production keystore already exists at android/app-production.keystore"
    echo "If you want to create a new one, delete the existing file first."
    echo "⚠️  WARNING: Creating a new keystore will make your existing app updates impossible!"
    exit 1
fi

echo "📝 Please provide the following information for your production keystore:"
echo ""

# Get keystore information
read -p "Keystore alias (e.g., 'doenit-prod'): " ALIAS
read -s -p "Keystore password (keep this secure!): " PASSWORD
echo ""
read -s -p "Confirm password: " PASSWORD_CONFIRM
echo ""

if [ "$PASSWORD" != "$PASSWORD_CONFIRM" ]; then
    echo "❌ Passwords don't match. Exiting."
    exit 1
fi

echo ""
echo "🏢 Certificate Information:"
read -p "First and Last Name: " CN
read -p "Organizational Unit (e.g., 'Development'): " OU
read -p "Organization (e.g., 'Your Company'): " O
read -p "City or Locality: " L
read -p "State or Province: " ST
read -p "Country Code (e.g., 'US', 'ZA'): " C

echo ""
echo "🔨 Generating production keystore..."

# Generate keystore
keytool -genkey -v \
    -keystore app-production.keystore \
    -alias "$ALIAS" \
    -keyalg RSA \
    -keysize 2048 \
    -validity 10000 \
    -storepass "$PASSWORD" \
    -keypass "$PASSWORD" \
    -dname "CN=$CN, OU=$OU, O=$O, L=$L, ST=$ST, C=$C"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Production keystore generated successfully!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Update your .env.production file with:"
    echo "   PUBLIC_KEYSTORE_ALIAS=\"$ALIAS\""
    echo "   PUBLIC_KEYSTORE_PASSWORD=\"$PASSWORD\""
    echo ""
    echo "2. 🔒 BACKUP THIS KEYSTORE FILE SECURELY!"
    echo "   Location: android/app-production.keystore"
    echo ""
    echo "3. 📱 Build your production app:"
    echo "   npm run app:prod"
    echo ""
    echo "⚠️  IMPORTANT: Never lose this keystore file or password!"
    echo "   You'll need them for all future app updates in Google Play Store."
else
    echo ""
    echo "❌ Failed to generate keystore. Please check the error messages above."
    exit 1
fi
