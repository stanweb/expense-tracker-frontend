/// <reference types="cypress" />

// Categories CRUD tests. Pre-seeds auth, then drives the categories page.
//
// The category form posts to /api/ai/get-icon to pick an icon. The backend
// may or may not implement that endpoint — we intercept it so the test
// doesn't fail on a 404. The actual category CRUD uses /api/users/{id}/categories.

import { stubAiIcon, unique, TEST_USER } from "../support/helpers";

describe("Categories — list and search", () => {
  beforeEach(() => {
    stubAiIcon();
    cy.visitAsAuthenticated("/categories", { ...TEST_USER });
    cy.contains(/^Categories$/, { timeout: 10000 }).should("be.visible");
    // Wait for the table to finish loading
    cy.contains(/You have \d+ categor/i, { timeout: 10000 }).should(
      "be.visible"
    );
  });

  it("renders the categories header and count", () => {
    // CardTitle renders a div with data-slot="card-title" (see ui/card.tsx).
    cy.get('[data-slot="card-title"]', { timeout: 10000 })
      .contains(/^Categories$/i)
      .should("be.visible");
    cy.contains(/Manage and organize/i).should("be.visible");
    cy.contains(/Add Category/i).should("be.visible");
  });

  it("filters categories by name via the search box", () => {
    const name = `Cy_${unique()}`;
    const description = `desc-${name}`;

    // Create a category via the form (uses the AI stub).
    cy.contains("button", /Add Category/i).click();
    cy.get("#name").type(name);
    cy.get("#description").type(description);
    cy.get('[role="dialog"]').contains("button", /Save/i).click();
    cy.wait("@aiGetIcon");

    // The row should appear in the table.
    cy.contains("td", name, { timeout: 10000 }).should("be.visible");

    // Now search for it.
    cy.get('input[placeholder="Search categories..."]').type(name);
    cy.contains("td", name).should("be.visible");

    // Search for something that doesn't exist.
    cy.get('input[placeholder="Search categories..."]')
      .clear()
      .type("zzz_nonexistent_zzz");
    cy.contains("td", name).should("not.exist");

    // Cleanup: clear search and delete the row we created.
    cy.get('input[placeholder="Search categories..."]').clear();
  });
});

describe("Categories — CRUD", () => {
  beforeEach(() => {
    stubAiIcon();
    cy.visitAsAuthenticated("/categories", { ...TEST_USER });
    cy.contains(/^Categories$/, { timeout: 10000 }).should("be.visible");
  });

  it("creates a new category", () => {
    const name = `Food_${unique()}`;
    cy.contains("button", /Add Category/i).click();
    cy.get('[role="dialog"]').within(() => {
      cy.get("#name").type(name);
      cy.get("#description").type("Restaurants and groceries");
      cy.contains("button", /Save/i).click();
    });
    cy.wait("@aiGetIcon");
    cy.contains("td", name, { timeout: 10000 }).should("be.visible");
  });

  it("edits an existing category", () => {
    const original = `Orig_${unique()}`;
    const updated = `Upd_${unique()}`;

    // Create
    cy.contains("button", /Add Category/i).click();
    cy.get('[role="dialog"]').within(() => {
      cy.get("#name").type(original);
      cy.get("#description").type("To be renamed");
      cy.contains("button", /Save/i).click();
    });
    cy.wait("@aiGetIcon");
    cy.contains("td", original, { timeout: 10000 }).should("be.visible");

    cy.intercept("POST", "**/api/ai/get-icon", {
      statusCode: 200,
      body: { iconName: "Tag" },
    });
    cy.contains("tr", original).within(() => {
      cy.get("button").last().click();
    });
    cy.contains('[role="menuitem"]', /Edit/i).click();
    cy.get('[role="dialog"]').within(() => {
      cy.get("#name").clear().should("have.value", "");
      // Wait for React state to settle after the controlled-input clear.
      // Without this, the first typed character can race the state update
      // and get dropped, leaving the value mangled (e.g. "pd_…" instead of
      // "Upd_…").
      cy.wait(200);
      cy.get("#name").type(updated, { delay: 100 });
      cy.contains("button", /Save/i).click();
    });
    cy.contains("td", updated, { timeout: 10000 }).should("be.visible");
    cy.contains("td", original).should("not.exist");
  });

  it("deletes a category", () => {
    const name = `Del_${unique()}`;

    // Create
    cy.contains("button", /Add Category/i).click();
    cy.get('[role="dialog"]').within(() => {
      cy.get("#name").type(name);
      cy.get("#description").type("to be removed");
      cy.contains("button", /Save/i).click();
    });
    cy.wait("@aiGetIcon");
    cy.contains("td", name, { timeout: 10000 }).should("be.visible");

    // Delete via row action menu
    cy.contains("tr", name).within(() => {
      cy.get("button").last().click();
    });
    cy.contains('[role="menuitem"]', /Delete/i).click();
    cy.contains("td", name, { timeout: 10000 }).should("not.exist");
  });

  it("cancels the form without saving", () => {
    const name = `Cancel_${unique()}`;
    cy.contains("button", /Add Category/i).click();
    cy.get('[role="dialog"]').within(() => {
      cy.get("#name").type(name);
      cy.contains("button", /Cancel/i).click();
    });
    cy.get('[role="dialog"]').should("not.exist");
    cy.contains("td", name).should("not.exist");
  });
});
