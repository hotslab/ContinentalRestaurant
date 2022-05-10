/// <reference types="cypress" />
import "cypress-localstorage-commands"
import * as moment from 'moment'
import { TableInterface } from '../../../src/models/v1/Table'
import { BookingInterface } from '../../../src/models/v1/Booking'

describe('Bookings Crud', () => {
  before(() => {
    cy.task('dbTeardown')
    cy.task('dbSeed')
  })
  after(() => {
    cy.task('dbTeardown')
  })
  it('List Bookings', () => {
    cy.request({
      method: 'GET',
      url: 'v1/public/bookings',
      qs: {
        email: '', // get all emails
        date: moment().format('YYYY-MM-DD'),
        hour: moment().format('H'),
        status: 'booked' 
      }
    }).should((response) => {
      expect(response.status).to.eq(200)
      expect(response.body).have.property('bookings')
    })
  })
  it('Create Booking', () => {
    (cy as any).createTable('winston@thecontinental.com', 'secret')
    cy.restoreLocalStorage()
    cy.getLocalStorage('table').then((table) => {
      const tableDetails: TableInterface = JSON.parse(table)
      cy.request({
        method: 'POST',
        url: 'v1/public/bookings',
        body: {
          name: 'john',
          surname: 'wick',
          email: 'john@thecontinental.com',
          people: 3,
          date: moment().format('YYYY-MM-DD'),
          hour: 9,
          table: tableDetails._id,
          creator_role: 'user',
          creator_email: 'john@thecontinental.com'
        }
      }).should((response) => {
        expect(response.status).to.eq(200)
        expect(response.body).have.property('booking')
        expect(response.body).have.property('message')
        cy.setLocalStorage('booking', JSON.stringify(response.body.booking))
        cy.saveLocalStorage()            
      })
    })
  })
  it('Update Booking', () => {
    cy.restoreLocalStorage()
    cy.getLocalStorage('booking').then(async (booking) => {
      const bookingDetails: BookingInterface = JSON.parse(booking)
      cy.request({
        method: 'PUT',
        url: `v1/public/bookings/${bookingDetails._id}`,
        body: {
          name: 'john',
          surname: 'wick',
          email: 'john@thecontinental.com',
          people: 7,
          date: moment().format('YYYY-MM-DD'),
          hour: 12,
          table: bookingDetails.table._id,
          creator_role: 'user',
          creator_email: 'john@thecontinental.com'
        }
      }).should((response) => {
        expect(response.status).to.eq(200)
        expect(response.body).have.property('booking')
        expect(response.body).have.property('message')
        cy.setLocalStorage('booking', JSON.stringify(response.body.booking))
        cy.saveLocalStorage()            
      })
    })
  })
  it('Show Booking', () => {
    cy.restoreLocalStorage()
    cy.getLocalStorage('booking').then(async (booking) => {
      const bookingDetails: BookingInterface = JSON.parse(booking)
      cy.request({
        method: 'GET',
        url: `v1/public/bookings/${bookingDetails._id}`
      }).should((response) => {
        expect(response.status).to.eq(200)
        expect(response.body).have.property('booking')
        cy.saveLocalStorage()            
      })
    })
  })
  it('Delete Booking', () => {
    cy.restoreLocalStorage()
    cy.getLocalStorage('booking').then(async (booking) => {
      const bookingDetails: BookingInterface = JSON.parse(booking)
      cy.request({
        method: 'DELETE',
        url: `v1/public/bookings/${bookingDetails._id}`
      }).should((response) => {
        expect(response.status).to.eq(200)
        expect(response.body).have.property('message')
        cy.removeLocalStorage('user')
        cy.removeLocalStorage('token')
        cy.removeLocalStorage('table')
        cy.removeLocalStorage('booking')
      })
    })
  })
})