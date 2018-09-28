/// <reference types="Cypress" />

context('Network Requests', () => {
  beforeEach(() => {
    cy.visit('/')
  })


  it('cy.server() - control behavior of network requests and responses', () => {
    // https://on.cypress.io/server

    cy.server().should((server) => {
      cy.route({
        method: "GET",
        url: "/images/*",
        response: { 
          url: "http://example.com",
          description: "Testing testing 123"
        }
      })
    })

    cy.get('img').should('have.alt', 'Testing testing 123');
  });

  // it('cy.request() - make an XHR request', () => {
  //   // https://on.cypress.io/request
  //   cy.request('https://jsonplaceholder.typicode.com/comments')
  //     .should((response) => {
  //       expect(response.status).to.eq(200)
  //       expect(response.body).to.have.length(500)
  //       expect(response).to.have.property('headers')
  //       expect(response).to.have.property('duration')
  //     })
  // })

  // it('cy.route() - route responses to matching requests', () => {
  //   // https://on.cypress.io/route

  //   let message = 'whoa, this comment does not exist'
  //   cy.server()

  //   // Listen to GET to comments/1
  //   cy.route('GET', 'comments/*').as('getComment')

  //   // we have code that gets a comment when
  //   // the button is clicked in scripts.js
  //   cy.get('.network-btn').click()

  //   // https://on.cypress.io/wait
  //   cy.wait('@getComment').its('status').should('eq', 200)

  //   // Listen to POST to comments
  //   cy.route('POST', '/comments').as('postComment')

  //   // we have code that posts a comment when
  //   // the button is clicked in scripts.js
  //   cy.get('.network-post').click()
  //   cy.wait('@postComment')

  //   // get the route
  //   cy.get('@postComment').should((xhr) => {
  //     expect(xhr.requestBody).to.include('email')
  //     expect(xhr.requestHeaders).to.have.property('Content-Type')
  //     expect(xhr.responseBody).to.have.property('name', 'Using POST in cy.route()')
  //   })

  //   // Stub a response to PUT comments/ ****
  //   cy.route({
  //     method: 'PUT',
  //     url: 'comments/*',
  //     status: 404,
  //     response: { error: message },
  //     delay: 500,
  //   }).as('putComment')

  //   // we have code that puts a comment when
  //   // the button is clicked in scripts.js
  //   cy.get('.network-put').click()

  //   cy.wait('@putComment')

  //   // our 404 statusCode logic in scripts.js executed
  //   cy.get('.network-put-comment').should('contain', message)
  // })
})
