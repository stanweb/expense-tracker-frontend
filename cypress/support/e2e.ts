// Import commands.js using ES2015 syntax:
import "./commands";

// Cypress settings for end-to-end tests.
Cypress.on("uncaught:exception", (err) => {
  // The app occasionally throws benign errors during navigation/redirects
  // (e.g. during AuthGuard redirects). We don't want to fail tests on those.
  return !err.message.includes("NEXT_REDIRECT");

});
