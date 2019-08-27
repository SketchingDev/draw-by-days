describe("Draw by Days", () => {
  const fiveSecondsInMs = 5000;

  beforeEach(() => {
    cy.clearDailyImages(Cypress.env("dailyImageDynamoDbTable"), Cypress.env("dailyImageDateDynamoDbTable"));
  });

  it("Page displays message if image not available", () => {
    cy.visit("/");
    cy.contains("Image isn't available yet, please try again later");
  });

  it("Page displays image if image available", () => {
    cy.invokeLambda(Cypress.env("ingestLambdaName"));

    cy.wait(fiveSecondsInMs);
    cy.visit("/");

    cy.get("img").should("be.visible");
  });
});
