describe("Draw by Days", () => {
  beforeEach(() => {
    cy.server();
  });

  it("Error message", () => {
    cy.visit("/");
    cy.contains("Error loading image");
  });

  it("Image not available", () => {
    cy.clock(Date.parse("2011-01-01T00:00:00.000Z"));
    cy.route("GET", "/dailyImage/2011-01-01", "fixture:dailyImageApi-without-image.json");

    cy.visit("/");
    cy.contains("Image isn't available yet, please try again later");
  });

  it("Image available", () => {
    cy.clock(Date.parse("2019-06-09T00:00:00.000Z"));
    cy.route("GET", "/dailyImage/2019-06-09", "fixture:dailyImageApi-with-image.json");

    cy.visit("/");
    cy.get("img").should("be.visible");
  });
});
