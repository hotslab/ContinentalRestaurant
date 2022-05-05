<template>
  <q-card v-if="!showBookingSection" style="width: 500px">
    <q-card-section class="flex justify-between items-center">
      <h6 class="text-primary text-weight-light no-margin">Booking Date</h6>
      <q-input v-model="searchDate">
        <template v-slot:append>
          <q-icon name="event" class="cursor-pointer">
            <q-popup-proxy ref="qDateProxy" cover transition-show="scale" transition-hide="scale">
              <q-date :navigation-min-year-month="moment().format('YYYY/MM')" v-model="searchDate" mask="YYYY-MM-DD" >
                <div class="row items-center justify-end">
                  <q-btn v-close-popup label="Close" color="primary" flat />
                </div>
              </q-date>
            </q-popup-proxy>
          </q-icon>
        </template>
      </q-input>
    </q-card-section>
    <q-card-section>
      <q-toolbar class="bg-primary text-white shadow-2">
        <q-toolbar-title>Available Time Slots for {{ table.name }}</q-toolbar-title>
      </q-toolbar>
      <q-list bordered separator>
        <q-item v-for="(timeSlot, index) in tableTimeSlotsToday" :key="index">
          <q-item-section top avatar>
            <q-avatar color="secondary" text-color="white" icon="restaurant" />
          </q-item-section>

          <q-item-section>
            <q-item-label>{{ timeSlot.time_range }} at {{ searchDate }}</q-item-label>
            <q-item-label caption lines="2">Booked - {{ timeSlot.booked }}</q-item-label>
            <q-item-label caption lines="2">Waiting List - {{ timeSlot.queued }}</q-item-label>
          </q-item-section>

          <q-item-section side top>
            <q-btn 
              unelevated 
              color="primary"
              class="no-shadow q-mt-md"
              label="Book"
              @click="chooseTimeSlot(timeSlot)"
            />
          </q-item-section>
        </q-item>
      </q-list>
    </q-card-section>
    <q-card-actions align="right">
      <q-btn
        unelevated 
        class="no-shadow q-mt-md"
        color="negative"
        size="md"
        :no-caps="true"
        label="Cancel"
        @click="cancelBooking()"
      />
    </q-card-actions>
  </q-card>
  <q-card v-else style="width:400px">
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
    </q-card-section>
    <q-separator />
    <q-card-actions align="right">
      <q-btn
        unelevated 
        class="no-shadow q-mt-md"
        color="negative"
        size="md"
        :no-caps="true"
        label="Cancel"
        @click="cancelBooking()"
      />
      <q-btn
        unelevated 
        class="no-shadow q-mt-md"
        color="warning"
        size="md"
        :no-caps="true"
        label="Back"
        @click="restartSelection()"
      />
      <q-btn
        unelevated 
        class="no-shadow q-mt-md"
        color="primary"
        size="md"
        :no-caps="true"
        label="Create"
        @click="createBooking()"
      />
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
import moment from 'moment'
import { useStore } from 'src/stores/mainStore'
import { computed, ref, onMounted, watch } from 'vue'
import { api } from '../boot/axios'
import { useQuasar } from 'quasar'
import useValidations from '../composables/vuelidate'
import { useVuelidate } from '@vuelidate/core'
import { email, required, numeric, minValue, maxValue } from '@vuelidate/validators'
import TableTimeSlot from 'src/models/TableTimeSlot'
import Booking from 'src/models/Booking'
import { userInfo } from 'os'

// props
const props = defineProps(['table'])

// emits
const emit = defineEmits(['cancel-booking'])

// data
const showBookingSection = ref<boolean>(false)
const searchDate = ref<string>(moment().format('YYYY-MM-DD'))
const tableTimeSlotsToday = ref<TableTimeSlot[]>([])
const bookingDetails = {
  name: ref<string | null>(null),
  surname: ref<string | null>(null),
  email: ref<string | null>(null),
  people: ref<number | null>(null),
  date: ref<unknown>(moment().format('YYYY-MM-DD')),
  hour: ref<number | null>(null),
  table: ref<string | null>(null),
}

// computed
const rules = computed(() => {
  return {
    bookingDetails: {
      name: { required },
      surname: { required },
      email: { required, email },
      people: { required, numeric,  minValue: minValue(1),  manValue: maxValue(100) },
      date: { required },
      hour: { required, numeric },
    }
  }
})
const isManager = computed(() => $store.user !== null && $store.user.role == 'manager' )

// watcher
watch(searchDate, async (newDate) => { if (newDate) getTableData() })

// setup
const $store = useStore()
const $q = useQuasar()
const v$ = useVuelidate(rules, { bookingDetails })
const { passValidation, vuelidateErrors } = useValidations()

// methods
function chooseTimeSlot(selectedTimeSlot: TableTimeSlot) {
  showBookingSection.value = true
  bookingDetails.date.value = searchDate.value
  bookingDetails.hour.value = selectedTimeSlot.hour
  bookingDetails.table.value = selectedTimeSlot.table
}
function restartSelection() {
  showBookingSection.value = false
  bookingDetails.date.value = null
  bookingDetails.hour.value = null
  bookingDetails.table.value = null
}
function cancelBooking(newBooking: Booking | null = null) {
  emit('cancel-booking', newBooking)
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
    $q.loading.show()
    await api.post('bookings', {
      name: bookingDetails.name.value,
      surname: bookingDetails.surname.value,
      email: bookingDetails.email.value,
      people: bookingDetails.people.value,
      date: bookingDetails.date.value,
      hour: bookingDetails.hour.value,
      table: bookingDetails.table.value,
      creator_role: isManager.value ? 'manager' : 'user',
      creator_email: isManager.value
        ? $store.user?.email 
        : ($store.user ? $store.user?.email : bookingDetails.email.value) 
    }).then(
      response => {
        $q.loading.hide()
        notification(response.data.message, 'success')
        cancelBooking(response.data.booking)
      },
      error => {
        let errorMessage = null
        if (error.response) {
          errorMessage = error.response.data.message
        } else if (error.request) {
          errorMessage = error.request
        } else {
          errorMessage = error.message
        }
        notification(errorMessage, 'error')
        $q.loading.hide()
      }
    )
  })
}
async function getTableData() {
  if ((new Date((new Date()).setHours(0,0,0,0))).getTime() > (new Date(searchDate.value)).getTime()) {
    notification(`The date of ${searchDate.value} you have selected has already passed. Please choose a current date`, 'error')
    searchDate.value = moment().format('YYYY-MM-DD')
    return
  }
  $q.loading.show()
  await api.get('table-time-slots', { params: {
      tableId: props.table._id,
      openingHour: $store.openingTimes?.opening_hour,
      closingHour: $store.openingTimes?.closing_hour,
      date: searchDate.value
    }}).then(
    response => {
      tableTimeSlotsToday.value = response.data.tableTimeSlotsToday
      $q.loading.hide()
    },
    error => {
      let errorMessage = null
      if (error.response) {
        errorMessage = error.response.data.message
      } else if (error.request) {
        errorMessage = error.request
      } else {
        errorMessage = error.message
      }
      notification(errorMessage, 'error')
      $q.loading.hide()
    }
  )
}

// life cycle methods
onMounted(() => getTableData())
</script>

<style scoped>

</style>