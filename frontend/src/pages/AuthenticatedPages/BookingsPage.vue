<template>
  <q-page>
    <div class="full-width">
      <q-card flat inline class="full-width q-mt-lg bg-white q-pa-sm-md q-pa-none">
        <q-card-section class="full-width flex justify-between items-center">
          <div class="text-h6 text-normal text-primary">Current Bookings {{bookings.length }}</div>
          <q-btn round dense flat icon="search" @click="getBookings()" />
        </q-card-section>
        <q-card-section class="search-field">
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
            v-if="($store.user &&  $store.user.role == 'manager') || !$store.user "
          />
        </q-card-section>
      </q-card>
    </div>
    <div class="q-pa-md">
      <q-markup-table separator="horizontal" flat bordered>
        <thead class="bg-primary">
          <tr class="text-white text-bold">
            <th class="text-left">Table</th>
            <th v-if="$store.user" class="text-left">Email</th>
            <th v-if="$store.user" class="text-left">Name</th>
            <th v-if="$store.user" class="text-left">Surname</th>
            <th class="text-left">People</th>
            <th class="text-left">Date</th>
            <th class="text-left">Hour</th>
            <th class="text-left">Status</th>
            <th class="text-right" width="30px">View</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(booking, index) in bookings" :key="index">
            <td class="text-left">{{ booking.table?.name || "-" }}</td>
            <td v-if="$store.user" class="text-left">{{ booking.email || "-" }}</td>
            <td v-if="$store.user" class="text-left">{{ booking.name || "-" }}</td>
            <td v-if="$store.user" class="text-left">{{ booking.surname || "-" }}</td>
            <td class="text-left">{{ booking.people || "-" }}</td>
            <td class="text-left">{{ booking.date ? moment(booking.date).format('YYYY-MM-DD') : "-" }}</td>
            <td class="text-left">{{ hourFormat(booking.hour) }}</td>
            <td class="text-left">{{ booking.status || "-" }}</td>
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
import { ref, Ref, onMounted } from 'vue'
import { api } from 'src/boot/axios'
import { useQuasar } from 'quasar'
import { router } from 'src/router'
import Booking from 'src/models/Booking'
import moment from 'moment'
import { useStore } from 'src/stores/mainStore'
import { TimeSlot, timeOptions } from 'src/models/TimeSlot'

const loading = ref<boolean>(false)
const emailSearch = ref<string>('')
const dateSearch = ref<string>(moment().format('YYYY-MM-DD'))
const hourSearch = ref<string>(moment().format('H'))
let bookings: Ref<Array<Booking>> = ref([])
const timeSlots: Array<TimeSlot> = timeOptions

const $q = useQuasar()
const $store = useStore()


async function getBookings() {
  loading.value = true
  $q.loading.show()
  let userType
  if ($store.user && $store.user.role == 'manager') userType = 'manager'
  if ($store.user && $store.user.role == 'user') userType = 'user'
  if (!$store.user) userType = 'visitor'
  await api.get(
    'v1/public/bookings', {
      params: { 
        userType: userType,
        email: userType == 'user' ? $store.user?.email : emailSearch.value,
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
  router.push({name: 'booking', params: {id: booking._id } })
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
