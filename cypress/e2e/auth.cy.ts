/// <reference types="cypress" />

// Auth flow tests: login, register, validation, and protected-route redirects.
// The backend runs at /api/* (proxied by Next.js middleware to the internal API).
// These tests hit the real backend, so make sure it is reachable before running.

import {TEST_USER, unique} from "../support/helpers";

describe("Auth — Login", () => {
  beforeEach(() => {
    cy.visit("/login");
  });

  it("renders the sign-in form", () => {
    cy.contains("h1, h2, [data-test=card-title]", /See where your money goes/i).should("be.visible");
    cy.get("#username").should("be.visible");
    cy.get("#password").should("be.visible");
    cy.get('button[type="submit"]').contains(/Sign in/i).should("be.visible");
    cy.contains("a", /Create an account/i).should(
      "have.attr",
      "href",
      "/register"
    );
  });

  it("shows validation errors when fields are empty", () => {
    cy.get("#username").focus().blur();
    cy.contains(/Username is required/i).should("be.visible");
    cy.get("#password").focus().blur();
    cy.contains(/Password is required/i).should("be.visible");
    cy.get('button[type="submit"]').should("not.be.disabled");
  });

  it("rejects usernames with invalid characters on blur", () => {
    cy.get("#username").type("ab").blur();
    cy.contains(/at least 3 characters/i).should("be.visible");

    cy.get("#username").clear().type("bad space!").blur();
    cy.contains(/letters, numbers, dots, dashes, or underscores only/i).should(
      "be.visible"
    );
  });

  it("rejects short passwords on blur", () => {
    cy.get("#password").type("abc").blur();
    cy.contains(/at least 6 characters/i).should("be.visible");
  });

  it("toggles password visibility", () => {
    cy.get("#password").type("hunter2");
    cy.get("#password").should("have.attr", "type", "password");
    cy.get('button[aria-label="Show password"]').click();
    cy.get("#password").should("have.attr", "type", "text");
    cy.get('button[aria-label="Hide password"]').click();
    cy.get("#password").should("have.attr", "type", "password");
  });

  it("shows an inline error on bad credentials", () => {
    cy.get("#username").type("definitely_not_a_real_user_xyz");
    cy.get("#password").type("wrongpassword123");
    cy.get('button[type="submit"]').click();

    // Either a 401 ("Invalid username or password") or a generic sign-in
    // failure message should surface — backend error wording varies.
    cy.contains(/invalid username or password|sign-in failed/i, {
      timeout: 10000,
    }).should("be.visible");
  });

  it("signs in with valid credentials and lands on the dashboard", () => {
    const username = `cypress_${unique()}`;
    const password = "password123";

    // Register first so we have a known account. The backend requires
    // firstName/lastName/email in addition to username/password.
    cy.request("POST", "/api/auth/register", {
      username,
      password,
      firstName: "Cypress",
      lastName: "Test",
      email: `${username}@example.com`,
    }).then((resp) => {
      expect(resp.status).to.be.oneOf([200, 201]);
    });

    cy.get("#username").type(username);
    cy.get("#password").type(password);
    cy.get('button[type="submit"]').click();

    // After login: if onboarding not done, push to /onboarding-wizard; else to /.
    cy.url({ timeout: 10000 }).should("match", /\/(onboarding-wizard)?$/);
  });
});

describe("Auth — Register", () => {
  beforeEach(() => {
    cy.visit("/register");
  });

  it("renders the registration form", () => {
    cy.contains(/Create your account/i).should("be.visible");
    cy.get("#firstName").should("be.visible");
    cy.get("#lastName").should("be.visible");
    cy.get("#email").should("be.visible");
    cy.get("#username").should("be.visible");
    cy.get("#password").should("be.visible");
    cy.get("#confirmPassword").should("be.visible");
    cy.contains("a", /Sign in/i).should("have.attr", "href", "/login");
  });

  it("validates password length and confirmation match", () => {
    cy.get("#username").type(`cypress_${unique()}`);
    cy.get("#password").type("short").blur();
    cy.contains(/at least 8 characters/i).should("be.visible");

    cy.get("#password").clear().type("password123");
    cy.get("#confirmPassword").type("different999").blur();
    cy.contains(/Passwords do not match/i).should("be.visible");
  });

  it("registers a new user, redirects to /login with username pre-filled, and signs in", () => {
    const username = `cypress_${unique()}`;
    const password = "password123";

    cy.get("#firstName").type("Cypress");
    cy.get("#lastName").type("Test");
    cy.get("#email").type(`${username}@example.com`);
    cy.get("#username").type(username);
    cy.get("#password").type(password);
    cy.get("#confirmPassword").type(password);
    cy.get('button[type="submit"]').click();

    // The register endpoint returns no tokens, so the UI redirects to
    // /login with ?username=... pre-filling the field.
    cy.url({ timeout: 10000 }).should("include", "/login");
    cy.url().should("include", `username=${username}`);
    cy.get("#username").should("have.value", username);

    // User types their password and signs in.
    cy.get("#password").clear().type(password);
    cy.get('button[type="submit"]').click();

    cy.url({ timeout: 10000 }).should("match", /\/(onboarding-wizard)?$/);
  });

  it("shows field-level validation errors when the new fields are empty", () => {
    // Submit immediately to surface all required-field errors.
    cy.get('button[type="submit"]').click();
    cy.contains(/First name is required/i).should("be.visible");
    cy.contains(/Last name is required/i).should("be.visible");
    cy.contains(/Email is required/i).should("be.visible");
  });

  it("rejects an invalid email address on blur", () => {
    cy.get("#email").type("not-an-email").blur();
    cy.contains(/Enter a valid email address/i).should("be.visible");

    cy.get("#email").clear().type("mutuastanley03@gmail.com").blur();
    cy.contains(/Enter a valid email address/i).should("not.exist");
  });
});

describe("Auth - Protected routes", () => {
  it("redirects an unauthenticated user from / to /login", () => {
    cy.visit("/");
    cy.url({ timeout: 8000 }).should("include", "/login");
  });

  it("redirects an unauthenticated user from /categories to /login", () => {
    cy.visit("/categories");
    cy.url({ timeout: 8000 }).should("include", "/login");
  });

  it("redirects an unauthenticated user from /all-transactions to /login", () => {
    cy.visit("/all-transactions");
    cy.url({ timeout: 8000 }).should("include", "/login");
  });

  it("logs out and returns to /login", () => {
    cy.visitAsAuthenticated("/categories", { ...TEST_USER });
    cy.url().should('not.include', '/login');
    cy.get('button[aria-label="Sign out"]', { timeout: 15000 })
      .should("be.visible")
      .and("not.be.disabled")
      .click();
    cy.get('[role="alertdialog"]')
      .contains("button", /^Sign out$/i)
      .should("be.visible")
      .click();

    cy.url({ timeout: 10000 }).should("include", "/login");
    cy.contains(/Welcome back/i).should("be.visible");
  });
});
