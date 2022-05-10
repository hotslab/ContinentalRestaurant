/// <reference types="cypress" />
import "cypress-localstorage-commands"

describe('Time Crud', () => {
  before(() => {
    cy.task('dbTeardown')
    cy.task('dbSeed')
  })
  after(() => {
    cy.task('dbTeardown')
  })
  it('Show Time', () => {
    cy.request('v1/public/times') 
    .should((response) => {
      expect(response.status).to.eq(200)
      expect(response.body).have.property('time')    
    })
  })
  it('Create Time', () => {
    (cy as any).login('winston@thecontinental.com', 'secret')
    cy.restoreLocalStorage()
    cy.getLocalStorage('token').then((token) => {
      const jwt_token = token
      cy.request({
        method: 'POST',
        url: 'v1/api/times',
        body: {
          opening_hour: 6,
          closing_hour: 20,
          days_open: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          creator_role: 'manager',
          creator_email: 'winston@thecontinental.com'
        },
        headers: {
          'content-type': 'application/json',
          'Authorization': `Bearer ${jwt_token}`
        }
      }).should((response) => {
        expect(response.status).to.eq(200)
        expect(response.body).have.property('time')
        cy.saveLocalStorage()            
      })
    })
  })
  it('Update Time', () => {
    (cy as any).login('winston@thecontinental.com', 'secret')
    cy.restoreLocalStorage()
    cy.getLocalStorage('token').then((token) => {
      const jwt_token = token
      cy.request({
        method: 'POST',
        url: 'v1/api/times',
        body: {
          opening_hour: 8,
          closing_hour: 18,
          days_open: ['Monday', 'Wednesday', 'Friday', 'Sunday'],
          creator_role: 'manager',
          creator_email: 'winston@thecontinental.com'
        },
        headers: {
          'content-type': 'application/json',
          'Authorization': `Bearer ${jwt_token}`
        }
      }).should((response) => {
        expect(response.status).to.eq(200)
        expect(response.body).have.property('time')
        cy.removeLocalStorage('user')
        cy.removeLocalStorage('token')
      })
    })
  })
})