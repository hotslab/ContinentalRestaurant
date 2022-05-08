<template>
  <q-card v-if="!showNotificationSection" class="full-width">
    <q-card-section>
      <h6 class="text-primary text-weight-light no-margin">Notifications</h6>
    </q-card-section>
    <q-list>
      <q-item clickable v-for="(notification, index) in notifications" 
        :key="index"
        @click="toggleShowNotification(notification, true)"
      >
        <q-item-section>
          <q-item-label>{{ `${index + 1}. ${notification.type}` }}</q-item-label>
          <q-item-label caption>
            {{  notification.description }}
          </q-item-label>
          <q-item-label class="text-bold" caption>
            {{ moment(notification.created).format('YYYY-MM-DD HH:mm:ss') }}
          </q-item-label>
        </q-item-section>
        <q-item-section avatar>
          <q-icon color="secondary" name="visibility" />
        </q-item-section>
      </q-item>
      <q-item v-if="notifications.length <= 0">
        <q-item-section>
          <q-item-label>No records found</q-item-label>
        </q-item-section>
      </q-item>
    </q-list>
    <q-card-actions align="right">
      <q-btn
        unelevated 
        class="no-shadow q-mt-md"
        color="negative"
        size="md"
        :no-caps="true"
        label="Close"
        @click="emit('close-notification')"
      />
    </q-card-actions>
  </q-card>
  <q-card v-else class="full-width">
    <q-card-section>
      <h6 class="text-primary text-weight-light no-margin">Notification Details</h6>
    </q-card-section>
    <q-list>
      <q-item>
        <q-item-section>
          <q-item-label>{{ selectedNotification?.type }}</q-item-label>
        </q-item-section>
        <q-item-section avatar>
          <q-icon color="secondary" name="notifications_active" />
        </q-item-section>
      </q-item>
      <q-item>
        <q-item-section>
          <q-item-label>Description</q-item-label>
          <q-item-label caption>{{ selectedNotification?.description || '-' }}</q-item-label>
        </q-item-section>
        <q-item-section avatar>
          <q-icon color="negative" name="info" />
        </q-item-section>
      </q-item>
      <q-item>
        <q-item-section>
          <q-item-label>Time</q-item-label>
          <q-item-label caption>{{ moment(selectedNotification?.created).format('YYYY-MM-DD HH:mm:ss') }}</q-item-label>
        </q-item-section>
        <q-item-section avatar>
          <q-icon color="primary" name="schedule" />
        </q-item-section>
      </q-item>
    </q-list>
    <q-card-actions align="right">
      <q-btn
        unelevated 
        class="no-shadow q-mt-md"
        color="warning"
        size="md"
        :no-caps="true"
        label="Close"
        @click="toggleShowNotification()"
      />
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
import moment from 'moment'
import { ref } from 'vue'
import { api } from 'src/boot/axios'
import { useQuasar } from 'quasar'
import Notification from 'src/models/Notification'

// props
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = defineProps(['notifications'])

// emits
const emit = defineEmits(['close-notification', 'remove-notification'])

// data
const selectedNotification = ref<Notification | null>(null)
const showNotificationSection = ref<boolean>(false)

// setup
const $q = useQuasar()

// methods
async function toggleShowNotification(notification: Notification | null = null, displayNotification = false) {
  if (!displayNotification && !notification) await notificationViewed()
  showNotificationSection.value = displayNotification
  selectedNotification.value = notification
}
function notification(message: string, type: string) {
  $q.notify({
    message: message,
    color: type == 'error' ? 'red' : 'cyan',
    timeout: 2000,
    position: 'top'
  })
}
async function notificationViewed() {
  $q.loading.show()
  await api.put(`notifications/${selectedNotification.value?._id}`).then(
    () => {
      $q.loading.hide()
      emit('remove-notification', selectedNotification.value?._id)
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
}
</script>

<style scoped>

</style>