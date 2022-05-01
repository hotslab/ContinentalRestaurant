<template>
  <q-card style="width:400px">
    <q-card-section>
      <h6 class="text-primary text-weight-light no-margin">Create Table</h6>
    </q-card-section>
    <q-card-section class="flex column justify-between q-pt-none">
      <q-input 
        v-model="name" 
        stack-label 
        label="Name" 
        :error-message="vuelidateErrors(v$.name.$silentErrors)"
        :error="v$.name.$invalid"
      />
      <q-input 
        v-model="description" 
        stack-label 
        label="Description" 
        :error-message="vuelidateErrors(v$.description.$silentErrors)"
        :error="v$.description.$invalid"
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
        @click="cancelTableCreation()"
      />
      <q-btn
        unelevated 
        class="no-shadow q-mt-md"
        color="primary"
        size="md"
        :no-caps="true"
        :label="props.editing ? 'Update' : 'Create' "
        @click="props.editing ? updateTable() : createTable()"
      />
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { api } from '../boot/axios'
import { useQuasar } from 'quasar'
import useValidations from '../composables/vuelidate'
import { useVuelidate } from '@vuelidate/core'
import { required } from '@vuelidate/validators'

const props = defineProps(['table', 'editing'])
const emit = defineEmits(['cancel-table'])

const name = ref<string | null>(null)
const description = ref<string | null>(null)

const rules = computed(() => { return { 
  name: { required },
  description: { required }
}})

const $q = useQuasar()
const v$ = useVuelidate(rules, { name, description })
const { passValidation, vuelidateErrors } = useValidations()

function cancelTableCreation(refreshTables = false) {
  emit('cancel-table', refreshTables)
}

function notification(message: string, type: string) {
  $q.notify({
    message: message,
    color: type == 'error' ? 'red' : 'cyan',
    timeout: 2000,
    position: 'top'
  })
}

async function updateTable() {
  await passValidation(v$.value).then(async () => {
    $q.loading.show({delay:100})
    await api.put(`tables/${props.table._id}`, {
      name: name.value,
      description: description.value
    }).then(
      response => {
        $q.loading.hide()
        notification(response.data.message, 'success')
        cancelTableCreation(true)
      },
      error => {
        $q.loading.hide()
        let errorMessage = null
        if (error.data?.message) {
          errorMessage = error.data.message
        } else if (error.response) {
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

async function createTable() {
  await passValidation(v$.value).then(async () => {
    $q.loading.show({delay:100})
    await api.post('tables', {
      name: name.value,
      description: description.value
    }).then(
      response => {
        $q.loading.hide()
        notification(response.data.message, 'success')
        cancelTableCreation(true)
      },
      error => {
        $q.loading.hide()
        let errorMessage = null
        if (error.data?.message) {
          errorMessage = error.data.message
        } else if (error.response) {
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

onMounted(() => {
  if (props.editing && props.table) {
    name.value = props.table.name
    description.value = props.table.description
  }
})
</script>

<style scoped>

</style>