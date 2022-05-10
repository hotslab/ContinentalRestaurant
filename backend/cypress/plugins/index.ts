/// <reference types="cypress" />
import seeder from '../../src/seeder/v1/test'
import { mongoDB } from '../../src/utils/v1/mongodb'

/**
 * @type {Cypress.PluginConfig}
 */
// eslint-disable-next-line no-unused-vars
export default (on, config) => {
  on("task", {
    async dbSeed() {
      return await seeder.seedDB()
    },
    async dbTeardown() {
      return await seeder.dropBD()
    },
    log(message: any) {
      console.log()
      console.log('#############################################')
      console.log(message)
      console.log('#############################################')
      console.log()
      return null
    }
  })
}