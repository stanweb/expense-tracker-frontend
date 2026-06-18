/// <reference types="cypress" />

// Dashboard layout tests. Pre-seeds auth tokens and verifies the dashboard
// renders its core sections. The backend is expected to return data for the
// currently-logged-in user; the assertions here are layout-level, not
// data-level.

import { TEST_USER } from "../support/helpers";

describe("Dashboard layout", () => {
  beforeEach(() => {
    cy.loginByLocalStorage({ ...TEST_USER });
    cy.visit("/");
    // Wait for the header greeting to appear, which means the AuthGuard
    // has accepted our pre-seeded auth state.
    cy.contains(/Welcome back/i, { timeout: 10000 }).should("be.visible");
  });

  it("shows the top-level greeting and brand", () => {
    cy.contains("h1", /Welcome back/i).should("be.visible");
    cy.contains(/Spending Tracker/i).should("be.visible");
  });

  it("renders the four main dashboard sections", () => {
    // Spending overview cards
    cy.contains(/Spending Overview|Total|Net|Month|Week/i, { timeout: 10000 })
      .should("exist");

    // Charts: spending chart and category breakdown
    cy.contains(/Spending Trend|Trend|Category|Categories/i).should("exist");

    // Recent transactions
    cy.contains(/Recent Transactions/i).should("be.visible");
  });

  it("navigates to /all-transactions via 'View all'", () => {
    cy.contains("a", /View all/i).first().click();
    cy.url({ timeout: 8000 }).should("include", "/all-transactions");
  });

  it("navigates to /categories from the nav", () => {
    cy.get('nav[aria-label="Primary"]').contains("a", /Categories/i).click();
    cy.url({ timeout: 8000 }).should("include", "/categories");
  });

  it("opens the date range picker", () => {
    // The DateRangePicker renders a button labelled with a date or "Pick a date".
    cy.contains("button", /Pick a date|From|To|All time|Date range/i)
      .first()
      .click();
    // A popover or calendar should appear; just confirm the picker is interactive.
    cy.get("[role=dialog], [data-radix-popper-content-wrapper]", {
      timeout: 5000,
    }).should("exist");
  });

  it("navigates to /budgets from the nav", () => {
    cy.get('nav[aria-label="Primary"]').contains("a", /Budgets/i).click();
    cy.url({ timeout: 8000 }).should("include", "/budgets");
  });
});
