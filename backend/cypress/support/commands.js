import 'dotenv/config'
import mongoose from 'mongoose'
import Notification from '../../src/models/v1/Notification'
import "cypress-localstorage-commands"

// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })


Cypress.Commands.add('login', (email, password) => {
  cy.restoreLocalStorage()
  cy.request('POST', 'v1/public/login', {
      email: email,
      password: password
  }).then((response) => {
    cy.setLocalStorage('token', response.body.token)
    cy.setLocalStorage('user', JSON.stringify(response.body.user))
    cy.saveLocalStorage()
  })
})

Cypress.Commands.add('createTable', (email, password) => {
  cy.login('winston@thecontinental.com', 'secret')
  cy.restoreLocalStorage()
  cy.getLocalStorage('token').then((token) => {
    const jwt_token = token
    cy.request({
      method: 'POST',
      url: 'v1/api/tables',
      body: {
        name: `Table ${new Date().getTime()}`,
        description: 'Generic test table'
      },
      headers: {
        'content-type': 'application/json',
        'Authorization': `Bearer ${jwt_token}`
      }
    }).should((response) => {
      expect(response.status).to.eq(200)
      expect(response.body).have.property('table')
      cy.setLocalStorage('table', JSON.stringify(response.body.table))
      cy.saveLocalStorage()
    })
  })
})
