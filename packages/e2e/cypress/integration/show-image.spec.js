// const AWS = require("aws-sdk");

describe("Draw by Days", () => {
  it("Page displays message if image not available", () => {
    cy.visit("/");
    cy.contains("Image isn't available yet, please try again later");
  });

  // it("Page displays image if image available", () => {
  //   const lambda = new AWS.Lambda();
  //   lambda.invoke({ FunctionName: "image-ingest-dev-pixabayImageIngester" });
  //
  //   cy.visit("/");
  //   cy.get("img").should("be.visible");
  // });
});
