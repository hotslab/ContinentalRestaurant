<template>
  <q-page>
    <div class="full-width">
      <q-card flat inline class="full-width q-mt-lg bg-white q-pa-sm-md q-pa-none">
        <q-card-section class="full-width justify-between items-center">
          <h5 class="text-primary text-weight-light no-margin">Bookings {{bookings.length}}</h5>
        </q-card-section>
      </q-card>
    </div>
    <div class="q-pa-md">
      <q-markup-table separator="horizontal" flat bordered>
        <thead class="bg-primary">
          <tr class="text-white text-bold">
            <th class="text-left">Email</th>
            <th class="text-right">Name</th>
            <th class="text-right">People</th>
            <th class="text-right">Surname</th>
            <th class="text-right">Time</th>
            <th class="text-right">Status</th>
            <th class="text-right">Created</th>
            <th class="text-right" width="30px">Update</th>
            <th class="text-right" width="30px">Delete</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(booking, index) in bookings" :key="index">
            <td class="text-left">{{ booking.email || "-" }}</td>
            <td class="text-right">{{ booking.name || "-" }}</td>
            <td class="text-right">{{ booking.people || "-" }}</td>
            <td class="text-right">{{ booking.surname || "-" }}</td>
            <td class="text-right">{{ booking.time || "-" }}</td>
            <td class="text-right">{{ booking.status || "-" }}</td>
            <td class="text-right">{{ booking.created ? moment(booking.created).format('YYYY-MM-DD HH:mm:ss') : "-" }}</td>
            <th class="text-right" width="30px">  <q-icon name="edit" /></th>
            <th class="text-right" width="30px"> <q-icon name="delete" /></th>
          </tr>
        </tbody>
      </q-markup-table>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { api } from 'src/boot/axios'
import { useQuasar } from 'quasar'
import Booking from 'src/models/Booking'
import moment from 'moment'

let bookings = ref<Array<Booking>>([])

const $q = useQuasar()

async function getBookings() {
  $q.loading.show({delay:100})
  await api.get('bookings').then(
    response => {
      $q.loading.hide()
      bookings.value = response.data.bookings
    },
    error => {
      $q.loading.hide()
      console.log(error)
    }
  )
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
