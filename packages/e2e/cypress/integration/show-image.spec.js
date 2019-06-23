describe("Draw by Days", () => {
  const oneSecondInMs = 2000;

  it("Page displays message if image not available", () => {
    cy.visit("/");
    cy.contains("Image isn't available yet, please try again later");
  });

  it("Page displays image if image available", () => {
    cy.invokeLambda(Cypress.env("ingestLambdaName"));

    cy.wait(oneSecondInMs);
    cy.visit("/");

    cy.get("img").should("be.visible");
  });
});
