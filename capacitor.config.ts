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
  plugins: {
    StatusBar: {
      style: "Light",
      backgroundColor: "#233a50",
      overlay: false,
    },
  },
};

export default config;
