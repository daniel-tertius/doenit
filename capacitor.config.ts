import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "doenit.app",
  appName: "Doenit",
  webDir: "build",
  server: {
    androidScheme: "https",
    iosScheme: "capacitor",
    allowNavigation: [],
  },
};

export default config;
