// const AWS = require("aws-sdk");

describe("Draw by Days", () => {
  beforeEach(() => {
    cy.server();
  });

  // it("Error message", () => {
  //   cy.visit("/");
  //   cy.contains("Error loading image");
  // });
  //
  // it("Page displays message if image not available", () => {
  //   cy.route("GET", "/dailyImage", "fixture:dailyImageApi-without-image.json");
  //
  //   cy.visit("/");
  //   cy.contains("Image isn't available yet, please try again later");
  // });
  //
  // it("Page displays message if image available", () => {
  //   cy.route("GET", "/dailyImage", "fixture:dailyImageApi-with-image.json");
  //
  //   cy.visit("/");
  //   cy.get("img").should("be.visible");
  // });

  it("Image API polled", () => {
    cy.route("GET", "/dailyImage", "fixture:dailyImageApi-without-image.json");

    cy.visit("/");
    cy.contains("Image isn't available yet, please try again later");

    cy.route("GET", "/dailyImage", "fixture:dailyImageApi-with-image.json");
    cy.get("img").should("be.visible");
  });
});
