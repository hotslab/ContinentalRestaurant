<template>
  <q-page class="flex column justify-start items-center">
    <q-card flat inline class="q-mt-lg bg-white q-pa-sm-md q-pa-none" style="width:320px">
      <q-card-section>
          <h5 class="text-primary text-weight-light no-margin">Login</h5>
      </q-card-section>
      <q-card-section class="flex column justify-between q-pt-none">
        <q-input 
          v-model="loginDetails.email.value" 
          stack-label 
          label="Email" 
          :error-message="vuelidateErrors(v$.loginDetails.email.$silentErrors)"
          :error="v$.loginDetails.email.$invalid"
        />
        <q-input
          stack-label  
          class="q-mt-md" 
          type="password" 
          label="Password"
          v-model="loginDetails.password.value" 
          :error-message="vuelidateErrors(v$.loginDetails.password.$silentErrors)"
          :error="v$.loginDetails.password.$invalid"
        />
        <q-btn
          unelevated 
          class="no-shadow q-mt-md"
          color="primary"
          size="md"
          :no-caps="true"
          label="Login"
          @click="login()"
        />
        <div class="q-mt-md flex column justify-between items-center">
          <p class="q-mb-none" @click="goTo('password-reset')">
            Fogot your password ?
            <span class="text-primary cursor-pointer">Reset it here</span>
          </p>
          <p class="q-mb-none" @click="goTo('register')">
            Don't have an account ?
            <span class="text-primary cursor-pointer">Register</span>
          </p>
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import {ref, computed} from 'vue'
import { api } from '../../boot/axios'
import { router } from '../../router'
import { useStore } from '../../stores/mainStore'
import { Loading, useQuasar } from 'quasar'
import useValidations from '../../composables/vuelidate'
import { useVuelidate } from '@vuelidate/core'
import { email, required } from '@vuelidate/validators'

const loginDetails = {
  email: ref<string | null>(null),
  password: ref<string | null>(null)
}

const rules = computed(() => {
  return {
    loginDetails: {
      email: { required, email },
      password: { required }
    }
  }
})

const $store = useStore()
const $q = useQuasar()
const v$ = useVuelidate(rules, { loginDetails })
const { passValidation, vuelidateErrors } = useValidations()

function goTo(routeName: string){
  router.push({name: routeName})
}

function notification(message: string, type: string) {
  $q.notify({
    message: message,
    color: type == 'error' ? 'red' : 'cyan',
    timeout: 2000,
    position: 'top'
  })
}

async function login(): Promise<void> {
  await passValidation(v$.value.loginDetails).then(async () => {
    Loading.show({delay: 100})
    await api.post('login', {
      email: loginDetails.email.value,
      password: loginDetails.password.value
    }).then(
      async response => {
        Loading.hide()
        await $store.setUser({token: response.data.token, ...response.data.user})
        notification('User logged in successfuly', 'success') 
        router.push({name:'tables'})
      },
      error => {
        Loading.hide()
        let errorMessage = null
        if (error.response) {
          errorMessage = error.response.data.message
        } else if (error.request) {
          errorMessage = error.request
        } else {
          errorMessage = error.message
        }
        notification(errorMessage, 'error')
      }
    )
  })
}


</script>

<style scoped>

</style>