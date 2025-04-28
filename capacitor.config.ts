import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "taskly.app",
  appName: "Taskly",
  webDir: "build",
  server: {
    androidScheme: "https",
    iosScheme: "capacitor",
    allowNavigation: [],
  },
};

export default config;
