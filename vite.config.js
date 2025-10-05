import tailwindcss from "@tailwindcss/vite";
import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [tailwindcss(), sveltekit()],
  server: {
    fs: {
      allow: [".."],
    },
  },
  build: {
    rollupOptions: {
      onLog: (level, log, handler) => {
        if (level === "warn") {
          if (log.message === 'Generated an empty chunk: "rxdb".') {
            return;
          }
          if (log.message === 'Generated an empty chunk: "rxdb-helper".') {
            return;
          }
        }

        handler(level, log);
      },
      output: {
        manualChunks: {
          // Separate chunk for translations
          translations: ["./src/lib/services/language/translations.js"],
          "firebase-app": ["./src/lib/chunk/firebase-app.ts"],
          "firebase-firestore": ["./src/lib/chunk/firebase-firestore.ts"],
          rxdb: ["./src/lib/chunk/rxdb.ts"],
          "rxdb-helper": ["./src/lib/chunk/rxdb_helper.ts"],
        },
      },
    },
  },
});
