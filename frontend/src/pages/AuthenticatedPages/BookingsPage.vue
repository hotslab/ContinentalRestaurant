<template>
  <q-page>
    <div class="full-width">
      <q-card flat inline class="full-width q-mt-lg bg-white q-pa-sm-md q-pa-none">
        <q-card-section class="full-width flex justify-between items-center">
          <div class="text-h6 text-normal text-primary">Current Bookings {{bookings.length }}</div>
          <q-input stack-lable v-model="emailSearch" placeholder="Email" >
            <template v-slot:after>
              <q-btn round dense flat icon="search" @click="getBookings()" />
            </template>
          </q-input>
        </q-card-section>
      </q-card>
    </div>
    <div class="q-pa-md">
      <q-markup-table separator="horizontal" flat bordered>
        <thead class="bg-primary">
          <tr class="text-white text-bold">
            <th class="text-left">Table</th>
            <th class="text-left">Email</th>
            <th class="text-left">Name</th>
            <th class="text-left">Surname</th>
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
            <td class="text-left">{{ booking.email || "-" }}</td>
            <td class="text-left">{{ booking.name || "-" }}</td>
            <td class="text-left">{{ booking.surname || "-" }}</td>
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

const loading = ref<boolean>(false)
const emailSearch = ref<string>('')
let bookings: Ref<Array<Booking>> = ref([])

const $q = useQuasar()

async function getBookings() {
  loading.value = true
  $q.loading.show()
  await api.get('v1/public/bookings', {params: { email: emailSearch.value }}).then(
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
</style>
