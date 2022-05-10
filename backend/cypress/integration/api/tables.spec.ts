/// <reference types="cypress" />
import "cypress-localstorage-commands"
import { TableInterface } from '../../../src/models/v1/Table'
import '../../../src/utils/v1/timezone'
import * as moment from 'moment'

describe('Table Crud', () => {
  before(() => {
    cy.task('dbTeardown')
    cy.task('dbSeed')
  })
  after(() => {
    cy.task('dbTeardown')
  })
  it('List Tables', () => {
    cy.request('v1/public/tables') 
    .should((response) => {
      expect(response.status).to.eq(200)
      expect(response.body).have.property('tables')    
    })
  })
  it('Create Table', () => {
    (cy as any).login('winston@thecontinental.com', 'secret')
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
  it('Update Table', () => {
    (cy as any).login('winston@thecontinental.com', 'secret')
    cy.restoreLocalStorage()
    cy.getLocalStorage('token').then((token) => {
      const jwt_token = token
      cy.getLocalStorage('table').then((table: any) => {
        const tableDetails: TableInterface = JSON.parse(table)
        cy.request({
          method: 'PUT',
          url: `v1/api/tables/${tableDetails._id}`,
          body: {
            name: `Table - ${tableDetails._id}`,
            description: 'Updated generic details'
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
  })
  it('List Tables', () => {
    cy.restoreLocalStorage()
    cy.getLocalStorage('table').then((table: any) => {
      const tableDetails: TableInterface = JSON.parse(table)
      cy.request({
        method: 'GET',
        url: 'v1/public/table-time-slots',
        qs: {
          tableId: tableDetails._id,
          openingHour: 8,
          closingHour: 18,
          date: moment().format('YYYY-MM-DD')
        }
      }).should((response) => {
        expect(response.status).to.eq(200)
        expect(response.body).have.property('tableTimeSlotsToday')
      })
    })
  })
  it('Delete Table', () => {
    (cy as any).login('winston@thecontinental.com', 'secret')
    cy.restoreLocalStorage()
    cy.getLocalStorage('token').then((token) => {
      const jwt_token = token
      cy.getLocalStorage('table').then((table: any) => {
        const tableDetails: TableInterface = JSON.parse(table)
        cy.request({
          method: 'DELETE',
          url: `v1/api/tables/${tableDetails._id}`,
          headers: {
            'content-type': 'application/json',
            'Authorization': `Bearer ${jwt_token}`
          }
        }).should((response) => {
          expect(response.status).to.eq(200)
          expect(response.body).have.property('message')
          cy.removeLocalStorage('user')
          cy.removeLocalStorage('token')
          cy.removeLocalStorage('table')
        })
      })
    })
  })
})