/// <reference types="cypress" />
import moment  from 'moment'

describe('TableCrud', () => {
   it('Get tables', () => {
      cy.request('http://thecontinentalbackend:3100/v1/public/tables')
      .should((response) => {
        expect(response.status).to.eq(200)
      })
   })
   it('Create table', () => {
      cy.request('POST', 'http://thecontinentalbackend:3100/v1/api/tables', {
        name: `Table ${new Date().getTime()}`,
        description: 'Generaic test table'
      })
      .should((response) => {
        expect(response.status).to.eq(200)
      })
   })
})