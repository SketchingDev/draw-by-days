/// <reference types="Cypress" />

context('Image on landing page', () => {

  it('Displays image', () => {
    cy.server().should((server) => {
      cy.route('GET', 'images/*', 'fixture:image-api/response.json')
        .as('getImage')
    });

    cy.visit('/')

    cy.wait('@getImage')
    cy.get('img').should('have.attr', 'alt', 'Test image');
  });

  it('Displays loading element', () => {
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

  it('Displays error message', () => {
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
