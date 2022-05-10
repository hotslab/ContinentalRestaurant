import { NotificationInterface } from '../../../src/models/v1/Notification';
/// <reference types="cypress" />
import "cypress-localstorage-commands"

describe('Notification Crud', () => {
  before(() => {
    cy.task('dbTeardown')
    cy.task('dbSeed')
  })
  after(() => {
    cy.task('dbTeardown')
  })
  it('List Notifications', () => {
    cy.request({
      method: 'GET',
      url: 'v1/public/notifications',
      qs: {
        email: 'john@thecontinental.com',
        role: 'user',
      }
    }).then((response) => {
      expect(response.status).to.eq(200)
      expect(response.body).have.property('notifications')
      cy.setLocalStorage('notification', JSON.stringify(response.body.notifications[0]))
      cy.saveLocalStorage()               
    })
  })
  it('Close Notification', () => {
    cy.restoreLocalStorage()
    cy.getLocalStorage('notification').then((notification) => {
      const notificationDetails: NotificationInterface = JSON.parse(notification)
      cy.request({
        method: 'PUT',
        url: `v1/public/notifications/${notificationDetails._id}`
      }).should((response) => {
        expect(response.status).to.eq(200)
        expect(response.body).have.property('notification') 
        cy.removeLocalStorage('notification')  
      })
    })
  })
})