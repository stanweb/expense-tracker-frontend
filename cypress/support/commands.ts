/// <reference types="cypress" />

// Mark this file as a module so `declare global` is honored. Without an
// import or export at the top level, the file is treated as a script and
// ambient declarations are dropped.
export {};

type AuthOptions = {
  // Credentials used to mint real tokens via /api/auth/login. Required.
  username: string;
  password: string;
  // Optional override for the seeded onboardingCompleted flag. Defaults to
  // whatever the login response returns.
  onboardingCompleted?: boolean;
};

// Looser shape for seedAuthAndVisit — those tests don't need a real password
// since they bypass /api/auth/login entirely.
type SeedAuthOptions = {
  username?: string;
  onboardingCompleted?: boolean;
};

type LoginResponse = {
  userId: number;
  username: string;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  refreshExpiresIn: number;
  onboardingCompleted: boolean;
};

// Real tokens obtained from /api/auth/login. We seed these into the
// redux-persist localStorage entry so the app boots authenticated without
// round-tripping through the login form.
const loginAndGetTokens = (opts: AuthOptions): Cypress.Chainable<LoginResponse> => {
  return cy
    .request({
      method: "POST",
      url: "/api/auth/login",
      body: { username: opts.username, password: opts.password },
      failOnStatusCode: false,
    })
    .then((resp) => {
      if (resp.status !== 200 && resp.status !== 201) {
        throw new Error(
          `loginByLocalStorage: login failed with ${resp.status}. ` +
            `Ensure user "${opts.username}" exists or register them first.`,
        );
      }
      return resp.body as LoginResponse;
    });
};

const buildDateRangeSlice = () => ({ fromDate: null, toDate: null });
const buildJobsSlice = () => ({});

const buildPersistedRoot = (
  userSlice: {
    userId: number;
    username: string;
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    refreshExpiresIn: number;
    onboardingCompleted: boolean;
  },
  onboardingOverride?: boolean,
) => ({
  user: JSON.stringify({
    ...userSlice,
    onboardingCompleted: onboardingOverride ?? userSlice.onboardingCompleted,
  }),
  dateRange: JSON.stringify(buildDateRangeSlice()),
  jobs: JSON.stringify(buildJobsSlice()),
});

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Performs a real /api/auth/login, then seeds the resulting tokens into
       * redux-persist's localStorage entry and navigates to /. The app boots
       * authenticated and the apiClient interceptor sends the real bearer
       * token issued by the backend, so dashboard calls succeed.
       *
       * Requires the user to already exist on the backend. Register them in
       * a before() hook if needed.
       */
      loginByLocalStorage(options: AuthOptions): Chainable<void>;

      /**
       * Visits a URL after a real /api/auth/login and token seed.
       */
      visitAsAuthenticated(
        url: string,
        options: AuthOptions
      ): Chainable<void>;

      /**
       * Generates a unique suffix for test data so specs don't collide.
       */
      uniqueId(): Chainable<string>;

      /**
       * Writes fake auth tokens to localStorage and navigates without calling
       * the backend. For tests that stub every API call (e.g. logout flow).
       * Do not use against a real backend — the tokens are placeholders.
       */
      seedAuthAndVisit(url: string, options?: SeedAuthOptions): Chainable<void>;
    }
  }
}

Cypress.Commands.add("uniqueId", () => {
  const id = `${Date.now()}-${Math.floor(Math.random() * 100000)}`;
  return cy.wrap(id);
});

Cypress.Commands.add("loginByLocalStorage", (options) => {
  loginAndGetTokens(options).then((login) => {
    const persistRoot = buildPersistedRoot(login, options.onboardingCompleted);
    cy.visit("/", {
      onBeforeLoad(win) {
        win.localStorage.setItem("persist:root", JSON.stringify(persistRoot));
      },
    });
  });
});

Cypress.Commands.add("visitAsAuthenticated", (url, options) => {
  loginAndGetTokens(options).then((login) => {
    const persistRoot = buildPersistedRoot(login, options.onboardingCompleted);
    cy.visit(url, {
      onBeforeLoad(win) {
        win.localStorage.setItem("persist:root", JSON.stringify(persistRoot));
      },
    });
  });
});

// Variant for tests that need a persisted auth shell without contacting the
// backend at all (e.g. logout-flow tests that stub every API call). The
// tokens here are intentionally fake — never use this in a spec that hits
// real /api/** endpoints.
Cypress.Commands.add(
  "seedAuthAndVisit",
  (url: string, options?: SeedAuthOptions) => {
    const fake = {
      userId: 1,
      username: options?.username ?? "testuser",
      accessToken: "fake-access-token-do-not-use-against-real-api",
      refreshToken: "fake-refresh-token",
      expiresIn: 3600,
      refreshExpiresIn: 86400,
      onboardingCompleted: options?.onboardingCompleted ?? true,
    };
    const persistRoot = buildPersistedRoot(fake, options?.onboardingCompleted);
    cy.visit(url, {
      onBeforeLoad(win) {
        win.localStorage.setItem("persist:root", JSON.stringify(persistRoot));
      },
    });
  },
);
