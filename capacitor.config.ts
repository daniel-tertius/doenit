import type { CapacitorConfig } from "@capacitor/cli";
import dotenv from "dotenv";

// Load environment-specific configuration
const environment = process.env.NODE_ENV || 'development';
dotenv.config({ path: `.env.${environment}` });
dotenv.config(); // Load default .env as fallback

const config: CapacitorConfig = {
  appId: process.env.PUBLIC_APP_ID || "doenit.app.dev",
  appName: process.env.PUBLIC_APP_NAME || "Doenit Dev",
  webDir: "build",
  server: {
    androidScheme: "https",
    iosScheme: "capacitor",
    allowNavigation: ["*.firebaseapp.com"],
  },
  plugins: {
    StatusBar: {
      style: "Dark",
      backgroundColor: "#202325",
      overlaysWebView: true,
    },
    LocalNotifications: {
      smallIcon: "ic_stat_logo",
      iconColor: "#ffffff",
    },
    FirebaseAuthentication: {
      skipNativeAuth: false,
      providers: ["google.com"],
    },
    GoogleAuth: {
      clientId: process.env.PUBLIC_GOOGLE_AUTH || "",
      scopes: ["profile", "email"],
      grantOfflineAccess: true,
    },
  },
  android: {
    buildOptions: {
      keystorePath: environment === 'production' ? "./app-production.keystore" : "./app.keystore",
      keystorePassword: process.env.PUBLIC_KEYSTORE_PASSWORD,
      keystoreAlias: process.env.PUBLIC_KEYSTORE_ALIAS,
      keystoreAliasPassword: process.env.PUBLIC_KEYSTORE_PASSWORD,
      releaseType: "AAB",
      signingType: "jarsigner",
    },
  },
};

export default config;
