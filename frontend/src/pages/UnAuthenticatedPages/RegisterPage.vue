<template>
  <q-page class="flex column justify-start items-center">
    <q-card flat inline class="q-mt-lg bg-white q-pa-sm-md q-pa-none" style="width:320px">
      <q-card-section>
          <h5 class="text-primary text-weight-light no-margin">Login</h5>
      </q-card-section>
      <q-card-section class="flex column justify-between q-pt-none">
        <q-input 
          v-model="registerDetails.name.value" 
          stack-label 
          label="Name" 
          :error-message="vuelidateErrors(v$.registerDetails.name.$silentErrors)"
          :error="v$.registerDetails.name.$invalid"
        />
        <q-input 
          v-model="registerDetails.surname.value" 
          stack-label 
          label="Surname" 
          :error-message="vuelidateErrors(v$.registerDetails.surname.$silentErrors)"
          :error="v$.registerDetails.surname.$invalid"
        />
        <q-input 
          v-model="registerDetails.email.value" 
          stack-label 
          label="Email" 
          :error-message="vuelidateErrors(v$.registerDetails.email.$silentErrors)"
          :error="v$.registerDetails.email.$invalid"
        />
        <q-input
          stack-label  
          class="q-mt-md" 
          type="password" 
          label="Password"
          v-model="registerDetails.password.value" 
          :error-message="vuelidateErrors(v$.registerDetails.password.$silentErrors)"
          :error="v$.registerDetails.password.$invalid"
        />
        <q-input
          stack-label  
          class="q-mt-md" 
          type="password" 
          label="Confirm Password"
          v-model="registerDetails.confirmPassword.value"
          :error-message="vuelidateErrors(v$.registerDetails.confirmPassword.$silentErrors)"
          :error="v$.registerDetails.confirmPassword.$invalid"
        />
        <q-btn
          unelevated 
          class="no-shadow q-mt-md"
          color="primary"
          size="md"
          :no-caps="true"
          label="Register"
          @click="register()"
        />
        <div class="q-mt-md flex column justify-between items-center">
          <p class="q-mb-none" @click="goTo('login')">
            Have an account ?
            <span class="text-primary cursor-pointer">Login here</span>
          </p>
          <p class="q-mb-none" @click="goTo('password-reset')">
            Fogot your password ?
            <span class="text-primary cursor-pointer">Reset it here</span>
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
import { useQuasar } from 'quasar'
import useValidations from '../../composables/vuelidate'
import { useVuelidate } from '@vuelidate/core'
import { email, required, sameAs } from '@vuelidate/validators'

const registerDetails = {
  name: ref<string | null>(null),
  surname: ref<string | null>(null),
  email: ref<string | null>(null),
  password: ref<string | null>(null),
  confirmPassword: ref<string | null>(null)
}

const rules = computed(() => {
  return {
    registerDetails: {
      name: { required },
      surname: { required },
      email: { required, email },
      password: { required },
      confirmPassword: { required, sameAsPassword: sameAs(registerDetails.password.value) }
    }
  }
})

const v$ = useVuelidate(rules, { registerDetails })
const $q = useQuasar()
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

async function register(): Promise<void> {
  await passValidation(v$.value.registerDetails).then(async () => {
    $q.loading.show()
    await api.post('register', {
      name: registerDetails.name.value,
      surname: registerDetails.surname.value,
      email: registerDetails.email.value,
      password: registerDetails.password.value,
      confirmPassword: registerDetails.confirmPassword.value
    }).then(
      () => {
        $q.loading.hide()
        notification('User registration was successful. Please login to your new account', 'success') 
        router.push({name:'login'})
      },
      error => {
        $q.loading.hide()
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