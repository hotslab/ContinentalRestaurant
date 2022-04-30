import { responseTime } from 'koa-response-time';
import { boot } from 'quasar/wrappers'
import axios, { AxiosInstance, AxiosRequestConfig, AxiosError,  AxiosResponse } from 'axios'
import { router } from '../router'
import { useStore } from '../stores/userStore'

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $axios: AxiosInstance;
  }
}

// Be careful when using SSR for cross-request state pollution
// due to creating a Singleton instance here;
// If any client changes this (global) instance, it might be a
// good idea to move this instance creation inside of the
// "export default () => {}" function below (which runs individually
// for each client)
const $store = useStore()


const api = axios.create({ baseURL: 'http://localhost:3020/' })

api.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    if ($store.$state?.user?.token) config.headers.Authorization = `Bearer ${$store.$state?.user?.token}`
    return config;
  },
  error => {
    return Promise.reject(error)
  }
)

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response && error.response.data) {
      console.error(`[Axios Error]`, error.response)
      checkIfUnauthorised(error)
    } else {
      console.error(`Unknown error`, error)
    }
    return Promise.reject(error)
  }
)

function checkIfUnauthorised(error: any) {
  if (error.response.data.error == 'Authentication Error') 
    return router.push({ name: 'login' })
}


export default boot(({ app }) => {
  // for use inside Vue files (Options API) through this.$axios and this.$api

  app.config.globalProperties.$axios = axios;
  // ^ ^ ^ this will allow you to use this.$axios (for Vue Options API form)
  //       so you won't necessarily have to import axios in each vue file

  app.config.globalProperties.$api = api;
  // ^ ^ ^ this will allow you to use this.$api (for Vue Options API form)
  //       so you can easily perform requests against your app's API
});

export { api }
