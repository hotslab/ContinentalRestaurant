<template>
<q-list padding>
  <q-item v-if="$store.user && $store.user.role == 'manager' " @click="goTo('users')" clickable>
    <q-item-section avatar>
      <q-icon name="people" />
    </q-item-section>
    <q-item-section>
      Users
    </q-item-section>
  </q-item>
  <q-item @click="goTo('tables')" clickable>
    <q-item-section avatar>
      <q-icon name="restaurant" />
    </q-item-section>
    <q-item-section>
      Tables
    </q-item-section>
  </q-item>
  <q-item v-if="$store.user && $store.user.role == 'manager' "  @click="goTo('bookings')" clickable>
    <q-item-section avatar>
      <q-icon name="book_online" />
    </q-item-section>
    <q-item-section>
      Bookings
    </q-item-section>
  </q-item>
  <q-item v-if="$store.user && $store.user.role == 'manager' " @click="showTimeModal = true" clickable>
    <q-item-section avatar>
      <q-icon name="schedule" />
    </q-item-section>
    <q-item-section>
      Opening Times
    </q-item-section>
  </q-item>
  <q-item v-if="!$store.user" @click="goTo('login')" clickable>
    <q-item-section avatar>
      <q-icon name="login" />
    </q-item-section>
    <q-item-section>
      Login
    </q-item-section>
  </q-item>
  <q-item v-if="!$store.user" @click="goTo('register')" clickable>
    <q-item-section avatar>
      <q-icon name="how_to_reg" />
    </q-item-section>
    <q-item-section>
      Register
    </q-item-section>
  </q-item>
  <q-item v-if="!$store.user" @click="goTo('password-reset')" clickable>
    <q-item-section avatar>
      <q-icon name="lock_reset" />
    </q-item-section>
    <q-item-section>
      Password Reset
    </q-item-section>
  </q-item>
  <q-item v-if="$store.user" @click="showNotificationModal = true" clickable>
    <q-item-section avatar>
      <q-icon name="notifications" />
    </q-item-section>
    <q-item-section>
      Notifications
    </q-item-section>
  </q-item>
  <q-item v-if="$store.user" @click="logout" clickable>
    <q-item-section avatar>
      <q-icon name="logout" />
    </q-item-section>
    <q-item-section>
      Logout
    </q-item-section>
  </q-item>
</q-list>
<q-dialog persistent v-model="showTimeModal" style="width: 500px">
  <OpeningTimes @cancel-times="showTimeModal = false" />
</q-dialog>
<q-dialog persistent v-model="showNotificationModal" style="width: 500px">
  <NotificationBar @cancel-notification="showNotificationModal = false" />
</q-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { router } from 'src/router'
import { useStore } from 'src/stores/mainStore'
import OpeningTimes from 'src/components/OpeningTimes.vue'
import NotificationBar from './NotificationBar.vue'

const showTimeModal = ref<boolean>(false)
const showNotificationModal = ref<boolean>(false)

const $store = useStore()

function goTo(routeName: string) {
  router.push({name: routeName})
}

function logout() {
  $store.setUser(null)
  goTo('login')
}
</script>

<style scoped>

</style>