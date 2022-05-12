<template>
  <q-page>
    <div class="full-width">
      <q-card flat inline class="full-width q-mt-lg bg-white q-pa-sm-md q-pa-none">
        <q-card-section class="full-width flex justify-between items-center">
          <h5 class="text-primary text-weight-light no-margin">Tables {{tables.length}}</h5>
          <q-btn
            v-if="$store.user && $store.user.role == 'manager' "
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
        <q-img height="200px" :src="getRandonPic()" />
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
          <q-btn v-if="$store.user && $store.user.role == 'manager' " 
            unelevated 
            color="negative" 
            @click="confirmDeleteTable(table)"
          >
            Delete
          </q-btn>
          <q-btn v-if="$store.user && $store.user.role == 'manager' "
            unelevated 
            color="secondary" 
            @click="openCreateOrUpdateTableModal(table)"
          >
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
  <q-dialog persistent v-model="showTableDeleteModal" style="width: 500px">
    <q-card>
      <q-card-section>
        Are you sure to delete {{ selectedTable?.name || 'table' }} ?
      </q-card-section>
      <q-card-actions align="right">
        <q-btn unelevated color="negative" @click="closeDeleteTable()">
          Cancel
        </q-btn>
        <q-btn unelevated color="primary" @click="deleteTable()">
          Delete
        </q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import CreateBooking from 'src/components/CreateBooking.vue'
import CreateOrUpdateTable from 'src/components/CreateOrUpdateTable.vue'
import { api } from 'src/boot/axios'
import { useQuasar } from 'quasar'
import Table from 'src/models/Table'
import { useStore } from 'src/stores/mainStore'
import Booking from 'src/models/Booking'
import { router } from 'src/router'

let tables = ref<Array<Table>>([])
const rating  = 4
const showReservationModal = ref<boolean>(false)
const showCreateOrUpdateTableModal = ref<boolean>(false)
const showTableDeleteModal = ref<boolean>(false)
const isEditingTable = ref<boolean>(false)
const selectedTable = ref<Table | null>(null)
const urlPath = `${location.protocol}//${location.hostname}${`:${location.port}` || ''}`
const pics = [
  `${urlPath}/foodpics/001.jpg`,
  `${urlPath}/foodpics/002.jpg`,
  `${urlPath}/foodpics/003.jpg`,
  `${urlPath}/foodpics/004.jpg`,
]

const $store = useStore()
const $q = useQuasar()

function getRandonPic() {
  return pics[Math.floor((Math.random()*pics.length))]
}

function openReservationModal(table: Table) {
  selectedTable.value = table
  showReservationModal.value = true
}

function closeReservation(newBooking: Booking | null = null) {
  selectedTable.value = null
  showReservationModal.value = false
  if (newBooking) router.push({path: '/booking', query: {id: newBooking._id } })
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


function confirmDeleteTable(table: Table | null) {
  showTableDeleteModal.value = true
  selectedTable.value = table
}

function closeDeleteTable() {
  selectedTable.value = null
  showTableDeleteModal.value = false
}

function notification(message: string, type: string) {
  $q.notify({
    message: message,
    color: type == 'error' ? 'red' : 'cyan',
    timeout: 2000,
    position: 'top'
  })
}

async function deleteTable() {
  $q.loading.show()
  await api.delete(`v1/api/tables/${selectedTable.value?._id}`).then(
    () => {
      closeDeleteTable()
      getTables()
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

onMounted(() => {
  getTables()
})
</script>

<style lang="sass" scoped>
.my-card
  width: 300px
</style>
