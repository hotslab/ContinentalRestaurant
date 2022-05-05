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
          <q-item-label>{{ notification.type }}</q-item-label>
          <q-item-label caption>
            {{ notification.description }}
          </q-item-label>
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
        @click="closeNotification()"
      />
    </q-card-actions>
  </q-card>
  <q-card v-else>
    <q-card-section>
      <h6 class="text-primary text-weight-light no-margin">Opening Times</h6>
    </q-card-section>
    <q-list>
      <q-item>
        <q-item-section>
          <q-item-label>Notification</q-item-label>
          <q-item-label caption>{{ selectedNotification.type }}</q-item-label>
        </q-item-section>
        <q-item-section avatar>
          <q-icon color="secondary" name="schedule" />
        </q-item-section>
      </q-item>
      <q-item>
        <q-item-section>
          <q-item-label>Description</q-item-label>
          <q-item-label caption>{{ selectedNotification.dsscription }}</q-item-label>
        </q-item-section>
        <q-item-section avatar>
          <q-icon color="negative" name="browse_gallery" />
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
        @click="toggleShowNotification()()"
      />
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { api } from 'src/boot/axios'
import { useQuasar } from 'quasar'
import { useStore } from 'src/stores/mainStore'
import IO from 'src/composables/socket'


const emit = defineEmits(['cancel-notification'])

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const notifications = ref<any[]>([])
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const selectedNotification = ref<any>(null)
const showNotificationSection = ref<boolean>(false)

const $q = useQuasar()
const $store = useStore()
const { socket } = IO()


function closeNotification() {
  emit('cancel-notification')
}
async function startSocket() {
  await socket.on('channel:notification',  data => {
    console.log('MESSAGE RECEIVED', data)
    notifications.value.push(data)
  })
}
async function toggleShowNotification(notification: any = null, displayNotification = false) {
  if (!displayNotification && !notification) notificationViewed()
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
  await api.put(`notifications/${selectedNotification.value._id}`).then(
    () => {
      $q.loading.hide()
      getNotifications()
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

async function getNotifications() {
  $q.loading.show()
    await api.get('notifications').then(
      response => {
        $store.setTime(response.data.time)
        notifications.value = response.data.notifications
        $q.loading.hide()
      },
      error => {$q.loading.hide(), console.log(error)}
    )
}

onMounted(() => {
  startSocket()
  getNotifications()
})
</script>

<style scoped>

</style>