<template>
  <q-page>
    <div class="full-width">
      <q-card flat inline class="full-width q-mt-lg bg-white q-pa-sm-md q-pa-none">
        <q-card-section class="full-width flex justify-between items-center">
          <div class="text-h6 text-normal text-primary">Current Bookings {{bookings.length }}</div>
          <q-btn round dense flat icon="search" @click="getBookings()" />
        </q-card-section>
        <q-card-section class="search-field">
          <q-input class="search-div" 
            stack-label
            label="Booking ID"
            v-model="bookingID" 
            placeholder="Booking ID" 
          />
          <q-select 
            class="search-div"
            v-model="hourSearch" 
            :options="timeSlots" 
            option-value="value"
            option-label="label"
            stack-label
            emit-value
            label="Booking Hour (24 hour format)"
          />
          <q-input stack-label label="Booking Date" class="search-div" v-model="dateSearch">
            <template v-slot:append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy ref="qDateProxy" cover transition-show="scale" transition-hide="scale">
                  <q-date :navigation-min-year-month="moment().format('YYYY/MM')" v-model="dateSearch" mask="YYYY-MM-DD" >
                    <div class="row items-center justify-end">
                      <q-btn v-close-popup label="Close" color="primary" flat />
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
          <q-input class="search-div" 
            stack-label
            label="Email"
            v-model="emailSearch" 
            placeholder="Email" 
          />
        </q-card-section>
      </q-card>
    </div>
    <div class="q-pa-md">
      <q-markup-table separator="horizontal" flat bordered>
        <thead class="bg-primary">
          <tr class="text-white text-bold">
            <th class="text-left">Booking ID</th>
            <th class="text-left">Table</th>
            <th v-if="$store.user" class="text-left">Email</th>
            <th v-if="$store.user" class="text-left">Name</th>
            <th v-if="$store.user" class="text-left">Surname</th>
            <th class="text-left" width="30px">People</th>
            <th class="text-left" width="50px">Date</th>
            <th class="text-left" width="30px">Hour</th>
            <th class="text-left" width="30px">Status</th>
            <th class="text-right" width="30px">View</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(booking, index) in bookings" :key="index">
            <td>{{ booking._id }}</td>
            <td class="text-left">{{ booking.table?.name || "-" }}</td>
            <td v-if="$store.user" class="text-left">
              {{ isManager ? booking.email : (booking.email == $store.user.email ? booking.email : '🚫') }}
            </td>
            <td v-if="$store.user" class="text-left">
              {{ isManager ? booking.name : (booking.email == $store.user.email ? booking.email : '🚫') }}
            </td>
            <td v-if="$store.user" class="text-left">
              {{ isManager ? booking.surname : (booking.email == $store.user.email ? booking.email : '🚫') }}
            </td>
            <td class="text-left" width="30px">{{ booking.people || "-" }}</td>
            <td class="text-left" width="50px">{{ booking.date ? moment(booking.date).format('YYYY-MM-DD') : "-" }}</td>
            <td class="text-left" width="30px">{{ hourFormat(booking.hour) }}</td>
            <td class="text-left" width="30px">{{ booking.status || "-" }}</td>
            <th class="text-right" width="30px"> 
              <q-icon @click="viewBooking(booking)" size="sm" color="secondary" name="visibility" />
            </th>
          </tr>
        </tbody>
      </q-markup-table>
      <q-card v-if="bookings.length <= 0" flat bordered class="no-shadow">
        <q-card-section class="text-center">
          <h4 class="text-primary">No records found</h4>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, Ref, onMounted, computed } from 'vue'
import { api } from 'src/boot/axios'
import { useQuasar } from 'quasar'
import { router } from 'src/router'
import Booking from 'src/models/Booking'
import moment from 'moment'
import { useStore } from 'src/stores/mainStore'
import { TimeSlot, timeOptions } from 'src/models/TimeSlot'

const loading = ref<boolean>(false)
const bookingID = ref<string>('')
const emailSearch = ref<string>('')
const dateSearch = ref<string>(moment().format('YYYY-MM-DD'))
const hourSearch = ref<string>(moment().format('H'))
let bookings: Ref<Array<Booking>> = ref([])
const timeSlots: Array<TimeSlot> = timeOptions

const $q = useQuasar()
const $store = useStore()

const isManager = computed(() => {
  return $store.user && $store.user.role =='manager'
}) 
async function getBookings() {
  loading.value = true
  $q.loading.show()
  await api.get(
    'v1/public/bookings', {
      params: { 
        booking_id: bookingID.value,
        email: emailSearch.value,
        date: dateSearch.value,
        hour: hourSearch.value
      }
  }).then(
    response => {
      loading.value = false
      $q.loading.hide()
      bookings.value = response.data.bookings
    },
    () => {
      loading.value = false
      $q.loading.hide()
    }
  )
}
function hourFormat(hour: number | null): string {
  return hour 
    ? (hour == 24 ? '00:00' : (hour < 10 ? `0${hour}:00` : `${hour}:00`))
    : '-'
}
function viewBooking(booking: Booking) {
  router.push({path: '/booking', query: {id: booking._id } })
}

onMounted(() => {
  getBookings()
})
</script>

<style lang="sass" scoped>
.my-card
  width: 100%
  max-width: 250px
.search-field
  display: flex
  align-items: center
  justify-content: space-between
  flex-wrap: wrap
  .search-div
    width: 300px
    margin-left: 10px
    margin-right: 10px

</style>
