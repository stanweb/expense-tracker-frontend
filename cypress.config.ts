import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:3000",
    specPattern: "cypress/e2e/**/*.cy.{ts,tsx,js,jsx}",
    supportFile: "cypress/support/e2e.ts",
    viewportWidth: 1280,
    viewportHeight: 800,
    defaultCommandTimeout: 8000,
    video: false,
    screenshotOnRunFailure: true,
    setupNodeEvents(on, config) {
      on("task", {
        log(message) {
          console.log("[LOG]", message);
          return null;
        }
      });
      return config;
    }
  },
});
