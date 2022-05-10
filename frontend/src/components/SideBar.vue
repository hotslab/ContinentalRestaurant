<template>
<q-list padding>
  <q-item v-if="$store.user && $store.user.role == 'manager' " @click="goTo('users')" clickable>
    <q-item-section avatar>
      <q-btn dense unelevated color="secondary" round icon="people" />
    </q-item-section>
    <q-item-section>
      Users
    </q-item-section>
  </q-item>
  <q-item @click="goTo('tables')" clickable>
    <q-item-section avatar>
      <q-btn dense unelevated color="secondary" round icon="restaurant" />
    </q-item-section>
    <q-item-section>
      Tables
    </q-item-section>
  </q-item>
  <q-item @click="goTo('bookings')" clickable>
    <q-item-section avatar>
      <q-btn dense unelevated color="secondary" round icon="book_online" />
    </q-item-section>
    <q-item-section>
      Bookings
    </q-item-section>
  </q-item>
  <q-item @click="showTimeModal = true" clickable>
    <q-item-section avatar>
      <q-btn dense unelevated color="secondary" round icon="schedule" />
    </q-item-section>
    <q-item-section>
      Opening Times
    </q-item-section>
  </q-item>
  <q-item v-if="!$store.user" @click="goTo('login')" clickable>
    <q-item-section avatar>
      <q-btn dense unelevated color="secondary" round icon="login" />
    </q-item-section>
    <q-item-section>
      Login
    </q-item-section>
  </q-item>
  <q-item v-if="!$store.user" @click="goTo('register')" clickable>
    <q-item-section avatar>
      <q-btn dense unelevated color="secondary" round icon="how_to_reg" />
    </q-item-section>
    <q-item-section>
      Register
    </q-item-section>
  </q-item>
  <q-item v-if="!$store.user" @click="goTo('password-reset')" clickable>
    <q-item-section avatar>
      <q-btn dense unelevated color="secondary" round icon="lock_reset" />
    </q-item-section>
    <q-item-section>
      Password Reset
    </q-item-section>
  </q-item>
  <q-item v-if="$store.user" @click="showNotificationModal = true" clickable>
    <q-item-section avatar>
      <q-btn dense unelevated color="secondary" round icon="notifications">
        <q-badge v-if="notifications.length" color="red" floating>{{ notifications.length }}</q-badge>
      </q-btn>
    </q-item-section>
    <q-item-section>
      Notifications
    </q-item-section>
  </q-item>
  <q-item v-if="$store.user" @click="logout" clickable>
    <q-item-section avatar>
      <q-btn dense unelevated color="secondary" round icon="logout" />
    </q-item-section>
    <q-item-section>
      Logout
    </q-item-section>
  </q-item>
</q-list>
<q-dialog persistent v-model="showTimeModal" style="width: 500px">
  <OpeningTimes @cancel-times="showTimeModal = false" />
</q-dialog>
<q-dialog persistent v-model="showNotificationModal" style="width: 500px; overflow: none;">
  <NotificationBar 
    :notifications="notifications"
    @close-notification="showNotificationModal = false" 
    @remove-notification="notificationToDelete => deleteNotifcation(notificationToDelete)"
  />
</q-dialog>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { router } from 'src/router'
import { useStore } from 'src/stores/mainStore'
import OpeningTimes from 'src/components/OpeningTimes.vue'
import NotificationBar from './NotificationBar.vue'
import IO from 'src/composables/socket'
import { api } from 'src/boot/axios'
import { useQuasar } from 'quasar'
import Notification from 'src/models/Notification'


// data
const notifications = ref<Notification[]>([])
const showTimeModal = ref<boolean>(false)
const showNotificationModal = ref<boolean>(false)

// setup
const $store = useStore()
const { socket } = IO()
const $q = useQuasar()

// computed
const isManager = computed(() => $store?.user?.role == 'manager')

// methods
function goTo(routeName: string) {
  router.push({name: routeName})
}
function logout() {
  $store.setUser(null)
  goTo('login')
}
function startSocket() {
  socket.on('channel:notification', (data: Notification) => {
    console.log('socket message received', data)
    if ($store.user && isManager.value) 
      notifications.value.push(data)
    if ($store.user && !isManager.value && (data.receiver_email == $store.user.email || data.receiver_email == 'all')) 
      notifications.value.push(data)
    if (!$store.user && !isManager.value && data.receiver_email == 'all')
      notifications.value.push(data)
  })
}
function deleteNotifcation(notificationToDeleteId: string) {
  const indexToDelete = notifications.value.findIndex(notification => notification._id == notificationToDeleteId)
  notifications.value.splice(indexToDelete, 1)
}
async function getNotifications() {
  $q.loading.show()
    await api.get('v1/public/notifications', { params: {
      email: $store.user? $store.user?.email : '',
      role: isManager.value ? 'manager' : 'user'
    }}).then(
      response => {
        notifications.value = response.data.notifications
        $q.loading.hide()
      },
      error => {$q.loading.hide(), console.log(error)}
    )
}

// life cyle
onMounted(() => {
  startSocket()
  getNotifications()
})
</script>

<style scoped>

</style>