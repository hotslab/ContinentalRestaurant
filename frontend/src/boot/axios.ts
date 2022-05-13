import { boot } from 'quasar/wrappers'
import axios, { AxiosInstance, AxiosRequestConfig, AxiosError,  AxiosResponse } from 'axios'
import { router } from 'src/router'
import { useStore } from 'src/stores/mainStore'
import { Notify } from 'quasar'

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

const api = import.meta.env.PROD
  ? axios.create() 
  : axios.create({baseURL: 'http://localhost:3100/'})

api.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    if ($store.user?.token) config.headers.Authorization = `Bearer ${$store.user?.token}`
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
      console.error('[Axios Error]', error.response)
      checkIfUnauthorised(error)
    } else {
      console.error('Unknown error', error)
    }
    return Promise.reject(error)
  }
)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function checkIfUnauthorised(error: any) {
  const authErrors = ['Authentication Error', 'Authentication error', 'jwt expired']
  if (authErrors.includes(error.response.data.error)) {
    notification('You have been logged out as you are unauthorised due to expired sesssion or no authentification.', 'error')
    $store.setUser(null)
    router.push({ name: 'login' })
    return 
  } 
}


function notification(message: string, type: string) {
  Notify.create({
    message: message,
    color: type == 'error' ? 'red' : 'cyan',
    timeout: 2000,
    position: 'top',
  })
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
