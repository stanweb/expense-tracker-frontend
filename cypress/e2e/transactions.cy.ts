/// <reference types="cypress" />

// Transactions CRUD tests. Pre-seeds auth, drives the /all-transactions page.
//
// The "Add Transaction" modal lives in transaction-list-base (the "full"
// variant) which renders on /all-transactions. The dashboard's "Recent
// Transactions" panel is a *dashboard* variant and does not include the
// Add button — that's a no-op for users, but we exercise the full flow here.

import { stubAiIcon, unique, TEST_USER } from "../support/helpers";

const ensureCategory = (name: string, description: string) => {
  // Visits /categories, creates a category, waits for it to appear in the table.
  cy.visitAsAuthenticated("/categories", { ...TEST_USER });
  cy.contains(/^Categories$/, { timeout: 10000 }).should("be.visible");
  cy.contains("button", /Add Category/i).click();
  cy.get('[role="dialog"]').within(() => {
    cy.get("#name").clear().type(name);
    cy.get("#description").clear().type(description);
    cy.contains("button", /Save/i).click();
  });
  cy.wait("@aiGetIcon");
  cy.contains("td", name, { timeout: 10000 }).should("be.visible");
};

describe("Transactions — add a transaction", () => {
  beforeEach(() => {
    stubAiIcon();
    cy.loginByLocalStorage({ ...TEST_USER });

    // Make sure we have at least one category to pick from.
    const categoryName = `CyCat_${unique()}`;
    ensureCategory(categoryName, "For Cypress tests");

    // Now go to the transactions page.
    cy.visitAsAuthenticated("/all-transactions", { ...TEST_USER });
    cy.contains(/All Transactions|Transactions/i, { timeout: 10000 }).should(
      "be.visible"
    );
  });

  it("opens the Add Transaction modal and validates required fields", () => {
    cy.contains("button", /Add Transaction/i).click();
    cy.get('[role="dialog"]').within(() => {
      cy.contains(/Add New Transaction/i).should("be.visible");
      // Submit empty — should show validation errors for required fields.
      cy.contains("button", /Add Transaction$/i).click();
    });
    // The validation <p> tags render inside the dialog which is a Radix
    // portal at `position: fixed`. Some messages end up scrolled below
    // the dialog's visible area, so just assert they're in the DOM and
    // rendered (existence) — visibility is layout-dependent and brittle
    // for tests that don't care about the exact pixel layout.
    cy.contains("p.text-red-500", /Transaction ID is required/i).should("exist");
    cy.contains("p.text-red-500", /Amount must be greater than 0/i).should("exist");
    cy.contains("p.text-red-500", /Date is required/i).should("exist");
    cy.contains("p.text-red-500", /Recipient is required/i).should("exist");
    cy.contains("p.text-red-500", /Type is required/i).should("exist");
    cy.contains("p.text-red-500", /Raw message is required/i).should("exist");
    cy.contains("p.text-red-500", /Category is required/i).should("exist");
  });

  it("creates a new transaction successfully", () => {
    cy.contains("button", /Add Transaction/i).click();

    const txId = `TX_${unique()}`;
    const recipient = `Coffee Shop ${unique()}`;
    const amount = "250";

    cy.get('[role="dialog"]').within(() => {
      cy.get("#transactionId").type(txId);
      cy.get("#amount").type(amount);
      cy.get("#transactionCost").type("0");
      cy.get("#date").type("2026-06-17T10:30");
      cy.get("#recipient").type(recipient);
      cy.get("#rawMessage").type("You paid KES 250 to Coffee Shop");

      // Type select (Radix Select). The trigger lives inside the dialog,
      // but its options portal to document.body — so we have to drop
      // out of .within() to click the option.
      cy.contains("button, [role=combobox]", /Select a type/i).click();
    });
    cy.contains('[role="option"]', /^Spent$/i).click();

    cy.get('[role="dialog"]').within(() => {
      // Category select — pick the first available option.
      cy.contains("button, [role=combobox]", /Select a category/i).click();
    });
    cy.get('[role="option"]').first().click();

    cy.get('[role="dialog"]').within(() => {
      cy.contains("button", /^Add Transaction$/i).click();
    });

    // The transaction should now appear in the list.
    cy.contains(recipient, { timeout: 10000 }).should("be.visible");
  });
});

describe("Transactions — list and search", () => {
  beforeEach(() => {
    stubAiIcon();
    cy.loginByLocalStorage({ ...TEST_USER });

    // Seed a category and at least one transaction so the search filter
    // has something to filter against. Without data, the page renders
    // "No transactions yet" instead of "No transactions match your search".
    const categoryName = `CyCat_${unique()}`;
    ensureCategory(categoryName, "For Cypress tests");
    cy.visitAsAuthenticated("/all-transactions", { ...TEST_USER });
    cy.contains(/All Transactions|Transactions/i, { timeout: 10000 }).should(
      "be.visible"
    );

    // Create a single transaction so the list has at least one row.
    const recipient = `Search Test ${unique()}`;
    cy.contains("button", /Add Transaction/i).click();
    cy.get('[role="dialog"]').within(() => {
      cy.get("#transactionId").type(`TX_${unique()}`);
      cy.get("#amount").type("100");
      cy.get("#transactionCost").type("0");
      cy.get("#date").type("2026-06-17T10:30");
      cy.get("#recipient").type(recipient);
      cy.get("#rawMessage").type("seed for search test");
      cy.contains("button, [role=combobox]", /Select a type/i).click();
    });
    cy.contains('[role="option"]', /^Spent$/i).click();
    cy.get('[role="dialog"]').within(() => {
      cy.contains("button, [role=combobox]", /Select a category/i).click();
    });
    cy.get('[role="option"]').first().click();
    cy.get('[role="dialog"]').within(() => {
      cy.contains("button", /^Add Transaction$/i).click();
    });
    cy.contains(recipient, { timeout: 10000 }).should("be.visible");
  });

  it("shows the search input on the full list view", () => {
    cy.get('input[placeholder="Search transactions..."]').should("be.visible");
  });

  it("filters the list using the search box", () => {
    const query = `cypress_query_${unique()}`;
    cy.get('input[placeholder="Search transactions..."]').type(query);
    // If no matches, the empty-state appears.
    cy.contains(/No transactions match your search/i, { timeout: 5000 }).should(
      "be.visible"
    );
    cy.get('button[aria-label="Clear search"]').click();
    cy.get('input[placeholder="Search transactions..."]').should(
      "have.value",
      ""
    );
  });
});
