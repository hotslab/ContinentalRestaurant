<template>
  <q-page class="q-pa-md">
    <q-card v-if="!showEditSection" flat bordered class="no-shadow" style="width:300px;">
      <q-img :src="getRandonPic()" />
      <q-card-section>
        <div class="text-h6 text-light text-primary">
          {{booking?.table?.name || '-'}}
        </div>
        <div class="text-subtitle">{{ booking?.table.description || '-'}}</div>
      </q-card-section>
      <q-separator />
      <q-card-section class="q-pt-md">
        <div v-if="$store.user">
          <div class="text-subtitle text-light">
            Name: {{ `${booking?.name || '-'} ${booking?.surname || '-' }` }}
          </div>
          <div class="text-subtitle text-light">
            Email: {{ booking?.email || 'No details provided' }}
          </div>
        </div>
        <div class="text-subtitle text-light">
          People: {{ booking?.people || 'No details provided' }}
        </div>
        <div class="text-subtitle text-light">
          Status: {{ booking?.status || 'No details provided' }}
        </div>
        <div class="text-subtitle text-light">
          Date: {{ booking?.date ? moment(booking?.date).format('YYYY-MM-DD') : 'No details provided' }}
        </div>
        <div class="text-subtitle text-light">
          Time: {{ booking?.hour ?  booking?.hour < 10 ? `0${booking?.hour}:00` : `${booking?.hour}:00` : 'No details provided' }}
        </div>
      </q-card-section>
      <q-separator />
      <q-card-actions v-if="$store.user" align="right">
        <q-btn unelevated color="negative" @click="showBookingDeleteModal = true">
          Delete
        </q-btn>
        <q-btn unelevated color="primary" @click="toogleOpenEdit()">
          Edit
        </q-btn>
      </q-card-actions>
    </q-card>
    <!--EDITING--->
    <q-card v-else flat bordered class="no-shadow" style="width:300px;">
      <q-card-section>
        <div class="text-h6 text-light text-primary">Edit {{ booking?.table.name || 'booking' }}</div>
      </q-card-section>
      <q-list>
        <q-item>
          <q-item-section>
            <q-item-label>Table</q-item-label>
            <q-item-label caption>{{ selectedTable ? selectedTable.name : booking?.table.name }}</q-item-label>
          </q-item-section>
          <q-item-section avatar>
            <q-icon color="brown" name="restaurant" />
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section>
            <q-item-label>Date</q-item-label>
            <q-item-label caption>
              {{ 
                searchDate 
                ? searchDate 
                : ( booking?.date ? moment(booking?.date).format('YYYY-MM-DD') : '-' ) 
              }}
            </q-item-label>
          </q-item-section>
          <q-item-section avatar>
            <q-icon color="red" name="calendar_month" />
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section>
            <q-item-label>Time</q-item-label>
            <q-item-label caption>
              {{ 
                selectedTimeSlot 
                ? selectedTimeSlot.hour
                : (booking?.hour ?  booking?.hour < 10 ? `0${booking?.hour}:00` : `${booking?.hour}:00` : 'No details provided')
              }}
            </q-item-label>
          </q-item-section>
          <q-item-section avatar>
            <q-icon color="secondary" name="schedule" />
          </q-item-section>
        </q-item>
        <q-item clickable @click="openEditDateAndTime()">
            <q-item-section>
              <q-item-label>Click here to change table, date and time</q-item-label>
            </q-item-section>
            <q-item-section avatar>
              <q-icon color="primary" name="edit" />
            </q-item-section>
          </q-item>
      </q-list>
      <q-card-section class="flex column justify-between q-pt-none">
        <q-input 
          v-model="bookingDetails.name" 
          stack-label 
          label="Name" 
          :error-message="vuelidateErrors(v$.bookingDetails.name.$silentErrors)"
          :error="v$.bookingDetails.name.$invalid"
        />
        <q-input 
          v-model="bookingDetails.surname" 
          stack-label 
          label="Surname" 
          :error-message="vuelidateErrors(v$.bookingDetails.surname.$silentErrors)"
          :error="v$.bookingDetails.surname.$invalid"
        />
        <q-input 
          v-model="bookingDetails.email" 
          stack-label 
          label="Email" 
          :error-message="vuelidateErrors(v$.bookingDetails.email.$silentErrors)"
          :error="v$.bookingDetails.email.$invalid"
        />
        <q-input 
          v-model="bookingDetails.people"
          type="number" 
          stack-label 
          label="People" 
          :error-message="vuelidateErrors(v$.bookingDetails.people.$silentErrors)"
          :error="v$.bookingDetails.people.$invalid"
        />
      </q-card-section>
      <q-separator />
      <q-card-actions align="right">
        <q-btn unelevated color="negative" @click="toogleOpenEdit(true)">
          Back
        </q-btn>
        <q-btn unelevated color="primary" @click="updateBooking()">
          Update
        </q-btn>
      </q-card-actions>
    </q-card>
  </q-page>
  <q-dialog persistent v-model="showBookingDeleteModal" style="width: 500px">
    <q-card>
      <q-card-section>
        Are you sure to delete {{ booking?.email || 'booking' }} ?
      </q-card-section>
      <q-card-actions align="right">
        <q-btn unelevated color="negative" @click="showBookingDeleteModal = false">
          Cancel
        </q-btn>
        <q-btn unelevated color="primary" @click="deleteBooking()">
          Delete
        </q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
  <q-dialog persistent v-model="showChangeTableDetailsModal" style="width: 500px">
    <q-card v-if="!showTimeSlotSection" style="width: 400px">
      <q-card-section>
        <div class="text-h6 text-light text-primary">Choose Table</div>
      </q-card-section>
      <q-markup-table separator="horizontal" flat bordered>
        <thead class="bg-primary">
          <tr class="text-white text-bold">
            <th></th>
            <th class="text-left">Table</th>
            <th class="text-right" width="30px">Select</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(table, index) in tables" :key="index">
            <td><q-icon color="primary" size="sm" name="restaurant"/></td>
            <td class="text-left">{{ table.name || "-" }}</td>
            <th class="text-right" width="30px"> 
              <q-icon class="cursor-pointer" size="sm" @click="showTimeSlot(table)" color="secondary" name="thumb_up" />
            </th>
          </tr>
        </tbody>
      </q-markup-table>
      <q-card-actions align="right">
        <q-btn unelevated color="negative" @click="closeEditDateAndTime()">
          Cancel
        </q-btn>
      </q-card-actions>
    </q-card>
    <q-card v-else style="width: 400px">
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
      <q-toolbar class="bg-primary text-white shadow-2">
        <q-toolbar-title>Available Time Slots for {{ selectedTable?.name }}</q-toolbar-title>
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
      <q-card-actions align="right">
        <q-btn unelevated color="negative" @click="closeEditDateAndTime()">
          Cancel
        </q-btn>
        <q-btn unelevated color="warning" @click="goBackToTableSelection()">
          Back
        </q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { api } from 'src/boot/axios'
import { useQuasar } from 'quasar'
import { router } from 'src/router'
import { useRoute } from 'vue-router'
import Booking from 'src/models/Booking'
import TableTimeSlot from 'src/models/TableTimeSlot'
import Table from 'src/models/Table'
import moment from 'moment'
import { useStore } from 'src/stores/mainStore'
import useValidations from '../../composables/vuelidate'
import { useVuelidate } from '@vuelidate/core'
import { email, required, numeric, minValue, maxValue } from '@vuelidate/validators'

// data
const bookingDetails = ref<{
  name: string | null | undefined,
  surname: string | null | undefined,
  email: string | null | undefined,
  people: number | null | undefined
}>({
  name: null,
  surname: null,
  email: null,
  people: null
})
let booking = ref<Booking | null>(null)
const tables = ref<Array<Table>>([])
const tableTimeSlotsToday = ref<TableTimeSlot[]>([])
const selectedTable = ref<Table | null>(null)
const searchDate = ref<string | null>(null)
const selectedTimeSlot = ref<TableTimeSlot | null>(null)
const showBookingDeleteModal = ref<boolean>(false)
const showEditSection = ref<boolean>(false) 
const showChangeTableDetailsModal = ref<boolean>(false)
const showTimeSlotSection = ref<boolean>(false)
const urlPath = `${location.protocol}//${location.hostname}${`:${location.port}` || ''}`
const pics = [
  `${urlPath}/foodpics/001.jpg`,
  `${urlPath}/foodpics/002.jpg`,
  `${urlPath}/foodpics/003.jpg`,
  `${urlPath}/foodpics/004.jpg`,
]

// computed
const rules = computed(() => {
  return {
    bookingDetails: {
      name: { required },
      surname: { required },
      email: { required, email },
      people: { required, numeric,  minValue: minValue(1),  manValue: maxValue(100) }
    }
  }
})
const isManager = computed(() => $store.user !== null && $store.user.role == 'manager' )

// watcher
watch(searchDate, async (newDate) => { if (newDate) getTableData() })

// setup
const $store = useStore()
const v$ = useVuelidate(rules, { bookingDetails })
const { passValidation, vuelidateErrors } = useValidations()
const $q = useQuasar()
const $route = useRoute()


// methods
function notification(message: string, type: string) {
  $q.notify({
    message: message,
    color: type == 'error' ? 'red' : 'cyan',
    timeout: 2000,
    position: 'top'
  })
}
function toogleOpenEdit(reset = false) {
  showEditSection.value = reset ? false : true
  bookingDetails.value.name = reset ? null : booking.value?.name
  bookingDetails.value.surname = reset ? null : booking.value?.surname
  bookingDetails.value.email = reset ? null : booking.value?.email
  bookingDetails.value.people = reset ? null : booking.value?.people
}
function openEditDateAndTime() {
  showChangeTableDetailsModal.value = true
  getTables()
}
function closeEditDateAndTime() {
  showChangeTableDetailsModal.value = false
  showTimeSlotSection.value = false
  selectedTable.value = null
  searchDate.value = null
  selectedTimeSlot.value = null
}
function showTimeSlot(table: Table | null = null) {
  selectedTable.value = table
  searchDate.value = moment().format('YYYY-MM-DD')
  showTimeSlotSection.value = true
  getTableData()
}
function goBackToTableSelection() {
  selectedTimeSlot.value = null
  showTimeSlotSection.value = false
}
function chooseTimeSlot(timeSlot: TableTimeSlot) {
  selectedTimeSlot.value = timeSlot
  showChangeTableDetailsModal.value = false
  showTimeSlotSection.value = false
}
async function updateBooking() {
  await passValidation(v$.value.bookingDetails).then(async () => {
    $q.loading.show()
    await api.put(`v1/public/bookings/${booking.value?._id}`, {
      name: bookingDetails.value.name,
      surname: bookingDetails.value.surname,
      email: bookingDetails.value.email,
      people: bookingDetails.value.people,
      date: searchDate?.value || moment(booking.value?.date).format('YYYY-MM-DD'),
      hour: selectedTimeSlot.value?.hour || booking.value?.hour,
      table: selectedTable.value?._id || booking.value?.table?._id,
      creator_role: isManager.value ? 'manager' : 'user',
      creator_email: isManager.value
        ? $store.user?.email 
        : ($store.user ? $store.user?.email : bookingDetails.value.email) 
    }).then(
      response => {
        notification(response.data.message, 'success')
        $q.loading.hide() 
        goBack()
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
async function deleteBooking() {
  $q.loading.show()
  await api.delete(`v1/public/bookings/${booking.value?._id}`).then(
    response => {
      notification(response.data.message, 'success')
      $q.loading.hide() 
      goBack()
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
}
function getRandonPic() {
  return pics[Math.floor((Math.random()*pics.length))]
}
async function getBooking() {
  $q.loading.show()
  await api.get(`v1/public/bookings/${$route.params.id}`).then(
    response => {
      $q.loading.hide()
      booking.value = response.data.booking
    },
    error => {
      $q.loading.hide()
      console.log(error)
    }
  )
}
async function getTables() {
  $q.loading.show()
  await api.get('v1/public/tables').then(
    response => {
      $q.loading.hide()
      tables.value = response.data.tables
    },
    error => {
      $q.loading.hide()
      console.log(error)
    }
  )
}
async function getTableData() {
  const dateEvaluated = searchDate.value ? searchDate?.value : booking?.value?.date
  if (dateEvaluated) {
    if ((new Date((new Date()).setHours(0,0,0,0))).getTime() > (new Date(dateEvaluated)).getTime()) {
      notification(`The date of ${dateEvaluated} you have selected has already passed. Please choose a current date`, 'error')
      searchDate.value = null
      return
    }
    $q.loading.show()
    await api.get('v1/public/table-time-slots', { params: {
        tableId: selectedTable.value?._id || booking?.value?.table?._id,
        openingHour: $store.openingTimes?.opening_hour,
        closingHour: $store.openingTimes?.closing_hour,
        date: searchDate.value || booking?.value?.date
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
  } else {
    notification('No date was selected. Please try again', 'error')
    searchDate.value = null
  }
}
function goBack() {
  router.push({name: 'bookings'})
}

// lfe cycle hooks
onMounted(() => getBooking())
</script>

<style lang="sass" scoped>

</style>
