<template>
  <q-page>
    <div class="full-width">
      <q-card flat inline class="full-width q-mt-lg bg-white q-pa-sm-md q-pa-none">
        <q-card-section class=" full-width">
          <h5 class="text-primary text-weight-light no-margin">Tables {{tables.length}}</h5>
          <q-btn
            class="no-shadow q-mt-md"
            color="primary"
            size="md"
            :no-caps="true"
            label="Create Table"
            @click="openCreateTableModal()"
          />
        </q-card-section>
      </q-card>
    </div>
    <div class="q-pa-md row items-start q-gutter-md">
      <q-card class="my-card" v-for="(table, index) in tables" :key="index">
        <q-img :src="getRandonPic()" />
        <q-card-section>
          <q-btn
            fab
            color="primary"
            icon="place"
            class="absolute"
            style="top: 0; right: 12px; transform: translateY(-50%);"
          />

          <div class="row no-wrap items-center">
            <div class="col text-h6 ellipsis">
              The Continental
            </div>
            <div class="col-auto text-grey text-caption q-pt-md row no-wrap items-center">
              <q-icon name="place" />
              250 ft
            </div>
          </div>

          <q-rating v-model="rating" max="5" size="32px" />
        </q-card-section>
        <q-card-section class="q-pt-none">
          <div class="text-subtitle1">
            {{table.name}}
          </div>
          <div class="text-caption text-grey">
            Small plates, salads & sandwiches in an intimate setting.
          </div>
        </q-card-section>

        <q-separator />

        <q-card-actions>
          <q-btn flat round icon="event" />
          <q-btn flat color="primary" @click="openReservationModal(table)">
            Reserve
          </q-btn>
        </q-card-actions>
      </q-card>
      <div v-if="!tables.length" class="full-width">
        <q-card flat inline class="q-mt-lg bg-white q-pa-sm-md q-pa-none">
          <q-card-section>
            <h6 class="text-center text-weight-light no-margin">
              No tables have been added to the restaurant yet...
            </h6>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
  <q-dialog persistent v-model="showReservationModal" style="width: 500px">
    <CreateBooking @cancel-booking="e => closeReservation(e)" :table="selectedTable" />
  </q-dialog>
  <q-dialog persistent v-model="showCreateTableModal" style="width: 500px">
    <CreateTable @cancel-table="e => closeTableCreation(e)" />
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import CreateBooking from '../../components/CreateBooking.vue'
import CreateTable from 'src/components/CreateTable.vue'
import { api } from '../../boot/axios'
import { Loading } from 'quasar'
import Table from '../../models/Table'

let tables = ref<Array<Table>>([])
const rating  = 4
const showReservationModal = ref<boolean>(false)
const showCreateTableModal = ref<boolean>(false)
const selectedTable = ref<Table | null>(null)
const pics = [
   './foodpics/001.jpg',
   './foodpics/002.jpg',
   './foodpics/003.jpg',
   './foodpics/004.jpg',
]

function getRandonPic() {
  return pics[Math.floor((Math.random()*pics.length))]
}

function openReservationModal(table: Table) {
  selectedTable.value = table
  showReservationModal.value = true
}

function closeReservation(refreshTables: boolean) {
  selectedTable.value = null
  showReservationModal.value = false
  if (refreshTables) getTables()
}

function openCreateTableModal() {
  showCreateTableModal.value = true
}

function closeTableCreation(refreshTables: boolean) {
  showCreateTableModal.value = false
  if (refreshTables) getTables()
}

async function getTables() {
  Loading.show({delay:400})
  await api.get('tables').then(
    response => {
      Loading.hide()
      tables.value = response.data.tables
    },
    error => {
      Loading.hide()
      console.log(error)
    }
  )
}

onMounted(() => {
  getTables()
})
</script>

<style lang="sass" scoped>
.my-card
  width: 100%
  max-width: 250px
</style>
