/// <reference types="Cypress" />

context('Image on landing page', () => {

  it('User is shown the downloaded image', () => {
    cy.server().should((server) => {
      cy.route('GET', 'images/*', 'fixture:image-api/response.json')
        .as('getImage')
    });

    cy.visit('/')

    cy.wait('@getImage')
    cy.get('img').should('have.attr', 'alt', 'Test image');
  });

  it('User is informed of the image being downloaded', () => {
    cy.server().should((server) => {
      cy.route({
        method: "GET",
        url: "images/*",
        delay: 5000,
      })
    });

    cy.visit('/')
    cy.get('#image-loading').should('be.visible')
  });

  it('User is informed on an error downloading the image', () => {
    cy.server().should((server) => {
      cy.route({
        method: "GET",
        url: "images/*",
        force404: true,
      });
    });

    cy.visit('/')
    cy.get('#image-error').should('be.visible')
  });
})
