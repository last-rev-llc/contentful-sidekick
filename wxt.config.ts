import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  manifest: {
    name: "Sidekick",
    description: "A browser extension for web development and interaction",
    permissions: ["activeTab", "sidePanel", "tabs", "scripting"],
    action: {
      default_title: "Open Sidekick Panel",
    },
  },
  webExt: {
    disabled: true,
  },
  outDir: "dist",
  modules: ["@wxt-dev/module-react"],
});
