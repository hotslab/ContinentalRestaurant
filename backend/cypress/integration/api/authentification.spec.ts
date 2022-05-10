/// <reference types="cypress" />
import "cypress-localstorage-commands"
import { UserInterface } from '../../../src/models/v1/User'

describe('Authentification And User Crud', () => {
  before(() => {
    cy.task('dbTeardown')
    cy.task('dbSeed')
  })
  after(() => {
    cy.task('dbTeardown')
  })
  it('Blocked Unauthorised Request', () => {
    cy.getLocalStorage('token').then((token) => {
      cy.request({
        method: 'GET',
        url: 'v1/api/users',
        failOnStatusCode: false
      }).should((response) => {
        expect(response.status).to.eq(401)
        expect(response.body).have.property('error')
        expect(response.body.error).to.equal('Authentication Error')
      })
    })
  })
  it('Register', () => {
    const userData = {
      name: 'testname',
      surname: 'testsurname',
      email: `testemail-${new Date().getTime()}@testemail.com`,
      role: 'manager',
      password: 'secret',
      confirmPassword: 'secret'
    }
    cy.request('POST', 'v1/public/register', userData).should((response) => {
      expect(response.status).to.eq(200)
      cy.setLocalStorage('loginData', JSON.stringify({email: userData.email, password: userData.password}))
      cy.saveLocalStorage()
    })
  })
  it('Login', async () => {
    cy.restoreLocalStorage()
    cy.getLocalStorage('loginData').then((loginData: any) => {
      const login = JSON.parse(loginData)
      cy.request('POST', 'v1/public/login', {
        email: login.email,
        password: login.password
      }).should((response) => {
        expect(response.status).to.eq(200)
      })
    })
  })
  it('Reset Password', () => {
    cy.restoreLocalStorage()
    cy.getLocalStorage('loginData').then((loginData: any) => {
      const loginDetails = JSON.parse(loginData)
      // forgot password
      cy.request('POST', 'v1/public/forgot-password', {
        email: loginDetails.email
      }).should((response) => {
        expect(response.status).to.eq(200)
        expect(response.body).have.property('user')
      })
      // reset password
      const resetData = {
        email: loginDetails.email,
        password: 'test1234',
        confirmPassword: 'test1234'
      }
      cy.request({
        method: 'PUT',
        url: 'v1/public/reset-password',
        body: resetData
      }).should((response) => {
        expect(response.status).to.eq(200)
        cy.setLocalStorage('loginData', JSON.stringify({email: resetData.email, password: resetData.password}))
        cy.saveLocalStorage()   
      })
    })
  })
  it('List Users', () => {
    cy.restoreLocalStorage()
    cy.getLocalStorage('loginData').then(async (loginData: any) => {
      const loginDetails = JSON.parse(loginData)
      await (cy as any).login(loginDetails.email, loginDetails.password)
      cy.getLocalStorage('token').then((token) => {
        cy.request({
          method: 'GET',
          url: 'v1/api/users',
          headers: {
            'content-type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }).should((response) => {
          expect(response.status).to.eq(200)
          expect(response.body).have.property('users')
        })
      })
    })
  })
  it('Show User', () => {
    cy.restoreLocalStorage()
    cy.getLocalStorage('loginData').then(async (loginData: any) => {
      const loginDetails = JSON.parse(loginData)
      await (cy as any).login(loginDetails.email, loginDetails.password)
      cy.getLocalStorage('token').then((token: any) => {
        const jwt_token: string = token
        cy.getLocalStorage('user').then((user: any) => {
          const userDetails: UserInterface = JSON.parse(user)
          cy.request({
            method: 'GET',
            url: `v1/api/users/${userDetails._id}`,
            headers: {
              'content-type': 'application/json',
              'Authorization': `Bearer ${jwt_token}`
            }
          }).should((response) => {
            expect(response.status).to.eq(200)
            expect(response.body).have.property('user')
            cy.saveLocalStorage()
          })
        })
      })
    })
  })
  it('Update User', () => {
    cy.restoreLocalStorage()
    cy.getLocalStorage('loginData').then(async (loginData: any) => {
      const loginDetails = JSON.parse(loginData)
      await (cy as any).login(loginDetails.email, loginDetails.password)
      cy.getLocalStorage('token').then((token: any) => {
        const jwt_token: string = token
        cy.getLocalStorage('user').then((user: any) => {
          const userDetails: UserInterface = JSON.parse(user)
          const editUserDetails = {
            name: 'updatedtestname',
            surname: 'updatedtestname',
            email: `updated-${userDetails.email}`,
            role: userDetails.role,
            password: 'secret',
            confirmPassword: 'secret'
          }
          cy.request({
            method: 'PUT',
            url: `v1/api/users/${userDetails._id}`,
            body: editUserDetails,
            headers: {
              'content-type': 'application/json',
              'Authorization': `Bearer ${jwt_token}`
            }
          }).should((response) => {
            expect(response.status).to.eq(200)
            expect(response.body).have.property('user')    
            cy.setLocalStorage('loginData', JSON.stringify({email: editUserDetails.email, password: editUserDetails.password}))
            cy.setLocalStorage('user', JSON.stringify(response.body.user))
            cy.saveLocalStorage()
          })
        })
      })
    })
  })
  it('Delete User', () => {
    cy.restoreLocalStorage()
    cy.getLocalStorage('loginData').then(async (loginData: any) => {
      const loginDetails = JSON.parse(loginData)
      await (cy as any).login(loginDetails.email, loginDetails.password)
      cy.getLocalStorage('token').then((token: any) => {
        const jwt_token: string = token
        cy.getLocalStorage('user').then((user: any) => {
          const userDetails: UserInterface = JSON.parse(user)
          cy.request({
            method: 'DELETE',
            url: `v1/api/users/${userDetails._id}`,
            headers: {
              'content-type': 'application/json',
              'Authorization': `Bearer ${jwt_token}`
            }
          }).should((response) => {
            expect(response.status).to.eq(200)
            cy.removeLocalStorage('user')
            cy.removeLocalStorage('token')
            cy.removeLocalStorage('loginData')
          })
        })
      })
    })
  })
})
