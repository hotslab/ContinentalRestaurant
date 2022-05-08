<template>
  <q-card v-if="!showEditSection" style="width:400px">
    <q-toolbar class="bg-primary text-white no-shadow">
      <q-toolbar-title>Opening Times</q-toolbar-title>
    </q-toolbar>
    <q-list>
      <q-item>
        <q-item-section>
          <q-item-label>Opening Hour</q-item-label>
          <q-item-label caption>
            {{ 
              $store.openingTimes?.opening_hour < 10 
                ? `0${$store.openingTimes?.opening_hour}:00` : `${$store.openingTimes?.opening_hour}:00`
            }}
          </q-item-label>
        </q-item-section>
        <q-item-section avatar>
          <q-icon color="secondary" name="schedule" />
        </q-item-section>
      </q-item>
      <q-item>
        <q-item-section>
          <q-item-label>Closing Hour</q-item-label>
          <q-item-label caption>
            {{ 
              $store.openingTimes?.closing_hour < 10 
                ? `0${$store.openingTimes?.closing_hour}:00` : `${$store.openingTimes?.closing_hour}:00`
            }}
          </q-item-label>
        </q-item-section>
        <q-item-section avatar>
          <q-icon color="negative" name="browse_gallery" />
        </q-item-section>
      </q-item>
    </q-list>
    <q-toolbar class="bg-primary text-white no-shadow">
      <q-toolbar-title>Days Open</q-toolbar-title>
    </q-toolbar>
    <q-list>
      <q-item v-for="(day, index) in $store.openingTimes?.days_open" :key="index">
        <q-item-section>
          <q-item-label class="text-light">{{ `${index + 1}. ${capitalize(day)}` }}</q-item-label>
        </q-item-section>
      </q-item>
      <q-item v-if="$store.openingTimes?.days_open.length <= 0">
        <q-item-section>
          <q-item-label>No records found</q-item-label>
        </q-item-section>
      </q-item>
    </q-list>
    <q-separator />
    <q-card-actions align="right">
      <q-btn
        unelevated 
        class="no-shadow q-mt-md"
        color="negative"
        size="md"
        :no-caps="true"
        label="Close"
        @click="cancelEditTimes()"
      />
      <q-btn
        v-if="$store.user?.role == 'manager' "
        unelevated 
        class="no-shadow q-mt-md"
        color="primary"
        size="md"
        :no-caps="true"
        label="Edit"
        @click="toggleEdit(true)"
      />
    </q-card-actions>
  </q-card>
  <q-card v-else style="width:400px">
    <q-card-section>
      <h6 class="text-primary text-weight-light no-margin">Edit Opening Times</h6>
    </q-card-section>
    <q-card-section class="flex column justify-between q-pt-none">

    </q-card-section>
    <q-card-section class="flex column justify-between q-pt-none">
      <q-select 
        v-model="openingHour" 
        :options="timeSlots" 
        option-value="value"
        option-label="label"
        emit-value
        label="Opning Time (24 hour format)"
        :error-message="vuelidateErrors(v$.openingHour.$silentErrors)"
        :error="v$.openingHour.$invalid" 
      />
      <q-select 
        v-model="closingHour" 
        :options="timeSlots" 
        option-value="value"
        option-label="label"
        emit-value
        label="Closing Time (24 hour format)"
        :error-message="vuelidateErrors(v$.closingHour.$silentErrors)"
        :error="v$.closingHour.$invalid" 
      />
      <p class="mt-md">Days restaurant is open open:</p>
      <q-option-group
        :options="dayOptions"
        type="checkbox"
        v-model="daysOpen"
      />
    </q-card-section>
    <q-separator />
    <q-card-actions align="right">
      <q-btn
        unelevated 
        class="no-shadow q-mt-md"
        color="warning"
        size="md"
        :no-caps="true"
        label="Back"
        @click="toggleEdit()"
      />
      <q-btn
        unelevated 
        class="no-shadow q-mt-md"
        color="negative"
        size="md"
        :no-caps="true"
        label="Cancel"
        @click="cancelEditTimes()"
      />
      <q-btn
        unelevated 
        class="no-shadow q-mt-md"
        color="primary"
        size="md"
        :no-caps="true"
        label="Update"
        @click="updateTimes()"
      />
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { api } from 'src/boot/axios'
import { useQuasar, format } from 'quasar'
import useValidations from 'src/composables/vuelidate'
import { useVuelidate } from '@vuelidate/core'
import { required, numeric, helpers } from '@vuelidate/validators'
import Time from 'src/models/Time'
import { TimeSlot, timeOptions } from 'src/models/TimeSlot'
import { useStore } from 'src/stores/mainStore'


const emit = defineEmits(['cancel-times'])

const showEditSection = ref<boolean>(false)
const timeDetails = ref<Time | null>(null)
const openingHour = ref<number | null | undefined>(null)
const closingHour = ref<number | null | undefined>(null)
const daysOpen = ref<Array<string> | [] | undefined>([])
const dayOptions: Array<{label: string, value: string}> = [
  {label:'Monday', value: 'monday'},
  {label:'Tuesday', value: 'tuesday'},
  {label:'Wednesday', value: 'wednesday'},
  {label:'Thursday', value: 'thursday'},
  {label:'Friday', value: 'friday'},
  {label:'Saturday', value: 'saturday'},
  {label:'Sunday', value: 'sunday'}
]
const timeSlots: Array<TimeSlot> = timeOptions
const validateOpeningHour = (param: number) => helpers.withParams(
  { param },
  (value: number) => value < param
)
const validateClosingHour = (param: number) => helpers.withParams(
  { param },
  (value: number) => value > param
)

const rules = computed(() => { 
  return { 
    openingHour: { required, numeric, validateOpeningHour: helpers.withMessage('Opening hour should be less than the Closing hour ', validateOpeningHour(closingHour.value)) }, 
    closingHour: { required, numeric , validateClosingHour: helpers.withMessage('Closing hour should be greater than the Opening hour', validateClosingHour(openingHour.value)) }
  }
})

const $q = useQuasar()
const $store = useStore()
const v$ = useVuelidate(rules, { openingHour, closingHour })
const { passValidation, vuelidateErrors } = useValidations()
const { capitalize } = format

function toggleEdit(state = false) {
  showEditSection.value = state
}
function cancelEditTimes() {
  emit('cancel-times')
}
function notification(message: string, type: string) {
  $q.notify({
    message: message,
    color: type == 'error' ? 'red' : 'cyan',
    timeout: 2000,
    position: 'top'
  })
}
async function getTimes() {
  $q.loading.show()
    await api.get('times').then(
      response => {
        $store.setTime(response.data.time)
        timeDetails.value = response.data.time
        openingHour.value = timeDetails.value?.opening_hour
        closingHour.value = timeDetails.value?.closing_hour
        daysOpen.value = timeDetails.value?.days_open
        $q.loading.hide()
      },
      error => {$q.loading.hide(), console.log(error)}
    )
}
async function updateTimes() {
  await passValidation(v$.value).then(async () => {
    $q.loading.show()
    await api.post('times', {
      opening_hour: openingHour.value,
      closing_hour: closingHour.value,
      days_open: daysOpen.value,
      creator_role: $store.user?.role,
      creator_email: $store.user?.email
    }).then(
      response => {
        $store.setTime(response.data.time)
        $q.loading.hide()
        notification('Opening times have been updated successfuly', 'success')
        cancelEditTimes()
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

onMounted(() => getTimes())
</script>

<style scoped>

</style>