// Shared helpers for Cypress specs. Importing from this module keeps the
// helpers out of each spec's top-level scope (where they would collide
// with identically-named helpers in other specs).

export const unique = () =>
  `${Date.now()}-${Math.floor(Math.random() * 100000)}`;

// Test user that the protected-route specs (dashboard, categories,
// transactions, logout) sign in as. loginByLocalStorage hits the real
// /api/auth/login endpoint with these credentials, so the bearer token
// sent on dashboard calls is the one the backend actually issued.
//
// Update these if the backend seed data changes.
export const TEST_USER = {
  username: "stan",
  password: "123456",
};

// User used by the "logs out and returns to /login" spec. Its exact
// credentials don't matter — that test stubs the logout endpoint and
// never makes a real API call against this user.
export const TEST_LOGOUT_USER = {
  username: "testuser",
  password: "password123",
};

// Stub the AI icon endpoint so category forms can save even when the AI
// service is offline. Real backend may or may not implement the route;
// we always intercept it during tests.
export const stubAiIcon = () => {
  cy.intercept("POST", "**/api/ai/get-icon", {
    statusCode: 200,
    body: { iconName: "Tag" },
  }).as("aiGetIcon");
};
