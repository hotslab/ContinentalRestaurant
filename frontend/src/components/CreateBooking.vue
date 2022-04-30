<template>
  <q-card style="width:400px">
    <q-card-section>
      <h6 class="text-primary text-weight-light no-margin">Reserve {{ table?.name || 'Table' }}</h6>
    </q-card-section>
    <q-card-section class="flex column justify-between q-pt-none">
      <q-input 
        v-model="bookingDetails.name.value" 
        stack-label 
        label="Name" 
        :error-message="vuelidateErrors(v$.bookingDetails.name.$silentErrors)"
        :error="v$.bookingDetails.name.$invalid"
      />
      <q-input 
        v-model="bookingDetails.surname.value" 
        stack-label 
        label="Surname" 
        :error-message="vuelidateErrors(v$.bookingDetails.surname.$silentErrors)"
        :error="v$.bookingDetails.surname.$invalid"
      />
      <q-input 
        v-model="bookingDetails.email.value" 
        stack-label 
        label="Email" 
        :error-message="vuelidateErrors(v$.bookingDetails.email.$silentErrors)"
        :error="v$.bookingDetails.email.$invalid"
      />
      <q-input 
        v-model="bookingDetails.people.value"
        type="number" 
        stack-label 
        label="People" 
        :error-message="vuelidateErrors(v$.bookingDetails.people.$silentErrors)"
        :error="v$.bookingDetails.people.$invalid"
      />
      <q-select 
        v-model="bookingDetails.time.value" 
        :options="timeSlots" 
        option-value="value"
        option-label="label"
        emit-value
        label="Time"
        :error-message="vuelidateErrors(v$.bookingDetails.time.$silentErrors)"
        :error="v$.bookingDetails.time.$invalid" 
      />
    </q-card-section>
    <q-separator />
    <q-card-actions align="right">
    <q-btn
        class="no-shadow q-mt-md"
        color="negative"
        size="md"
        :no-caps="true"
        label="Cancel"
        @click="cancelBooking()"
      />
      <q-btn
        class="no-shadow q-mt-md"
        color="primary"
        size="md"
        :no-caps="true"
        label="Login"
        @click="createBooking()"
      />
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { api } from '../boot/axios'
import { Loading, useQuasar } from 'quasar'
import useValidations from '../composables/vuelidate'
import { useVuelidate } from '@vuelidate/core'
import { email, required, numeric, minValue, maxValue } from '@vuelidate/validators'
import TimeSlot from '../models/User'

const props = defineProps(['table'])
const emit = defineEmits(['cancel-booking'])

const bookingDetails = {
  name: ref(null),
  surname: ref(null),
  email: ref(null),
  people: ref(null),
  time: ref(null),
  table_id: ref(props.table?._id),
}
const timeSlots: Array<TimeSlot> = [
  ...Array(23).fill().map((_, index) => {
    const runningTotal = index + 1
    return {
      label: runningTotal < 10 ? `0${runningTotal}:00` : `${runningTotal}:00`,
      value: runningTotal
    }
  })
]

const rules = computed(() => {
  return {
    bookingDetails: {
      name: { required },
      surname: { required },
      email: { required, email },
      people: { required, numeric,  minValue: minValue(1),  manValue: maxValue(20) },
      time: { required, numeric },
    }
  }
})

const $q = useQuasar()
const v$ = useVuelidate(rules, { bookingDetails })
const { passValidation, vuelidateErrors } = useValidations()

function cancelBooking(refreshTables = false) {
  emit('cancel-booking', refreshTables)
}

function notification(message: string, type: string) {
  $q.notify({
    message: message,
    color: type == 'error' ? 'red' : 'cyan',
    timeout: 2000,
    position: 'top'
  })
}

async function createBooking() {
  await passValidation(v$.value.bookingDetails).then(async () => {
    Loading.show({delay:100})
    await api.post('bookings', {
      name: bookingDetails.name.value,
      surname: bookingDetails.surname.value,
      email: bookingDetails.email.value,
      people: bookingDetails.people.value,
      time: bookingDetails.time.value,
      table_id: bookingDetails.table_id.value
    }).then(
      response => {
        Loading.hide()
        notification(response.data.message, 'success')
        cancelBooking(true)
      },
      error => {
        let errorMessage = null
        if (error.data.message) {
          errorMessage = error.data.message
        } else if (error.response) {
          errorMessage = error.response.data
        } else if (error.request) {
          errorMessage = error.request
        } else {
          errorMessage = error.message
        }
        notification(errorMessage, 'error')
        Loading.hide()
      }
    )
  })
}
</script>

<style scoped>

</style>