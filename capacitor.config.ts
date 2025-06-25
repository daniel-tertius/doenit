import type { CapacitorConfig } from "@capacitor/cli";
import dotenv from "dotenv";
dotenv.config();

const config: CapacitorConfig = {
  appId: "doenit.app",
  appName: "Doenit",
  webDir: "build",
  server: {
    androidScheme: "https",
    iosScheme: "capacitor",
    allowNavigation: [],
  },
  plugins: {
    StatusBar: {
      style: "Dark",
      backgroundColor: "#202325",
      overlay: true,
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
  },
  android: {
    buildOptions: {
      keystorePath: "./app.keystore",
      keystorePassword: process.env.PUBLIC_KEYSTORE_PASSWORD,
      keystoreAlias: process.env.PUBLIC_KEYSTORE_ALIAS,
      keystoreAliasPassword: process.env.PUBLIC_KEYSTORE_PASSWORD,
      releaseType: "AAB",
      signingType: "jarsigner",
    },
  },
};

export default config;
