import type { CapacitorConfig } from "@capacitor/cli";
import dotenv from "dotenv";
dotenv.config();

const config: CapacitorConfig = {
  appId: "doenit.app",
  appName: "Doenit",
  webDir: "build",
  server: {
    androidScheme: "doenit",
    iosScheme: "capacitor",
    allowNavigation: ["*.firebaseapp.com"],
  },
  plugins: {
    StatusBar: {
      style: "Dark",
      backgroundColor: "#202325",
      overlay: true,
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
