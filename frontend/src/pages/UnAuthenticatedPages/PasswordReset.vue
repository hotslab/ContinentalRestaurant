<template>
  <q-page class="flex column justify-start items-center">
    <q-card flat inline class="q-mt-lg bg-white q-pa-sm-md q-pa-none" style="width:320px">
      <q-card-section>
          <h6 class="text-primary text-weight-light no-margin">
            {{ activateResetPasword ? 'Reset Password' : 'Enter Email Address to Reset' }}
          </h6>
      </q-card-section>
      <q-card-section class="flex column justify-between q-pt-none">
        <q-input 
          v-model="emailAddress" 
          stack-label 
          label="Email" 
          :error-message="vuelidateErrors(v$.emailAddress.$silentErrors)"
          :error="v$.emailAddress.$invalid"
        />
        <div v-if="activateResetPasword">
          <q-input
            stack-label  
            class="q-mt-md" 
            type="password" 
            label="Password"
            v-model="password" 
            :error-message="vuelidateErrors(v$.password.$silentErrors)"
            :error="v$.password.$invalid"
          />
          <q-input
            stack-label  
            class="q-mt-md" 
            type="password" 
            label="Confirm Password"
            v-model="confirmPasword" 
            :error-message="vuelidateErrors(v$.confirmPasword.$silentErrors)"
            :error="v$.confirmPasword.$invalid"
          />
        </div>
      </q-card-section>
      <div class="flex justify-between items-center">
        <q-btn
          unelevated 
          class="no-shadow q-mt-md"
          color="negative"
          size="md"
          :no-caps="true"
          label="Cancel"
          @click="goTo('login')"
        />
        <q-btn
          unelevated 
          class="no-shadow q-mt-md"
          color="primary"
          size="md"
          :no-caps="true"
          label="Submit"
          @click="activateResetPasword ? resetPassword() : forgotPassword()"
        />
      </div>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import {ref, computed} from 'vue'
import { api } from '../../boot/axios'
import { router } from '../../router'
import { Loading, useQuasar } from 'quasar'
import useValidations from '../../composables/vuelidate'
import { useVuelidate } from '@vuelidate/core'
import { email, required, requiredIf, sameAs } from '@vuelidate/validators'

const emailAddress = ref<string | null>(null)
const password = ref<string | null>(null)
const confirmPasword = ref<string | null>(null)
const activateResetPasword = ref<boolean>(false)

const rules = computed(() => {
  return {
    emailAddress: { required, email },
    password: { required: requiredIf(activateResetPasword.value) },
    confirmPasword: { 
      required: requiredIf(activateResetPasword.value), 
      sameAsPassword: sameAs(password.value) 
    }
  }
})

const v$ = useVuelidate(rules, { emailAddress, password, confirmPasword })
const $q = useQuasar()
const { passValidation, vuelidateErrors } = useValidations()

function goTo(routeName: string){
  clearAllValues()
  router.push({name: routeName})
}

function clearAllValues() {
  activateResetPasword.value = false
  emailAddress.value = null
  password.value = null
  confirmPasword.value = null
}

function notification(message: string, type: string) {
  $q.notify({
    message: message,
    color: type == 'error' ? 'red' : 'cyan',
    timeout: 2000,
    position: 'top'
  })
}

async function forgotPassword(): Promise<void> {
  await passValidation(v$.value).then(async () => {
    Loading.show({delay: 100})
    await api.post('forgot-password', {
      email: emailAddress.value
    }).then(
      response => {
        Loading.hide()
        notification('User found. Please add your new password', 'success') 
        if (response.data.user) activateResetPasword.value = true
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

async function resetPassword(): Promise<void> {
  await passValidation(v$.value).then(async () => {
    Loading.show({delay: 100})
    await api.put('reset-password', {
      email: emailAddress.value,
      password: password.value,
      confirmPassword: confirmPasword.value
    }).then(
      () => { 
        Loading.hide()
        notification('Password has been reset successfuly', 'success') 
        goTo('login') 
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
      }
    )
  })
}

</script>

<style scoped>

</style>