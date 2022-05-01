<template>
  <q-page>
    <div class="full-width">
      <q-card flat inline class="full-width q-mt-lg bg-white q-pa-sm-md q-pa-none">
        <q-card-section class="full-width flex justify-between items-center">
          <h5 class="text-primary text-weight-light no-margin">Tables {{tables.length}}</h5>
          <q-btn
            v-if="$store.$state.user && $store.$state.user.role == 'manager' "
            unelevated
            class="no-shadow q-mt-md"
            color="primary"
            size="md"
            :no-caps="true"
            label="Create Table"
            @click="openCreateOrUpdateTableModal()"
          />
        </q-card-section>
        <q-card-section class="full-width flex justify-between items-center">
          <p>
            Book your table below. Please note tables are booked in advance for the next hour up until closing time. You cannot book for the current hour. <br/>
            If your tables was already booked by another person you will be put in a wating queue should it be cancelled before the dining session starts.   
          </p>
        </q-card-section>
      </q-card>
    </div>
    <div class="q-pa-md row items-start q-gutter-md">
      <q-card class="my-card" v-for="(table, index) in tables" :key="index">
        <q-img :src="getRandonPic()" />
        <q-card-section class="q-pt-none">
          <div class="col text-h6 ellipsis">
            {{table.name}}
          </div>
          <div class="text-caption text-grey">
            {{ table.description || 'No details provided' }}
          </div>
          <q-rating v-model="rating" max="5" size="32px" />
        </q-card-section>

        <q-separator />

        <q-card-actions align="right">
          <q-btn unelevated color="negative" @click="deleteTable(table)">
            Delete
          </q-btn>
          <q-btn unelevated color="secondary" @click="openCreateOrUpdateTableModal(table)">
            Edit
          </q-btn>
          <q-btn unelevated color="primary" @click="openReservationModal(table)">
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
  <q-dialog persistent v-model="showCreateOrUpdateTableModal" style="width: 500px">
    <CreateOrUpdateTable @cancel-table="e => closeTableCreationOrUpdate(e)" :table="selectedTable" :editing="isEditingTable" />
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import CreateBooking from 'src/components/CreateBooking.vue'
import CreateOrUpdateTable from 'src/components/CreateOrUpdateTable.vue'
import { api } from 'src/boot/axios'
import { Loading } from 'quasar'
import Table from 'src/models/Table'
import { useStore } from 'src/stores/mainStore'

let tables = ref<Array<Table>>([])
const rating  = 4
const showReservationModal = ref<boolean>(false)
const showCreateOrUpdateTableModal = ref<boolean>(false)
const isEditingTable = ref<boolean>(false)
const selectedTable = ref<Table | null>(null)
const pics = [
   './foodpics/001.jpg',
   './foodpics/002.jpg',
   './foodpics/003.jpg',
   './foodpics/004.jpg',
]

const $store = useStore()

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

function openCreateOrUpdateTableModal(table: Table | null = null) {
  showCreateOrUpdateTableModal.value = true
  selectedTable.value = table
  if (table) isEditingTable.value = true
}

function closeTableCreationOrUpdate(refreshTables: boolean) {
  showCreateOrUpdateTableModal.value = false
  selectedTable.value = null
  isEditingTable.value = false
  if (refreshTables) getTables()
}

function deleteTable() {
  //
}

async function getTables() {
  Loading.show({delay:100})
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
  width: 300px
</style>
