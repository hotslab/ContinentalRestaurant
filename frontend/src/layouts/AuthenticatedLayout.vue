<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title>
          The Continental Restaurant
        </q-toolbar-title>

        <div>Quasar v{{ $q.version }}</div>
      </q-toolbar>
    </q-header>

     <q-drawer
        v-model="leftDrawerOpen"
        show-if-above
        :width="200"
        :breakpoint="400"
      >
        <q-scroll-area style="height: calc(100% - 150px); margin-top: 150px; border-right: 1px solid #ddd">
          <q-list padding>
            <q-item @click="goTo('tables')" clickable>
              <q-item-section avatar>
                <q-icon name="restaurant" />
              </q-item-section>

              <q-item-section>
                Tables
              </q-item-section>
            </q-item>
            <q-item @click="goTo('tables')" clickable>
              <q-item-section avatar>
                <q-icon name="book_online" />
              </q-item-section>

              <q-item-section>
                Bookings
              </q-item-section>
            </q-item>
            <q-item @click="showTimeModal = true" clickable>
              <q-item-section avatar>
                <q-icon name="schedule" />
              </q-item-section>

              <q-item-section>
                Opening Times
              </q-item-section>
            </q-item>
            <q-item @click="logout" clickable>
              <q-item-section avatar>
                <q-icon name="logout" />
              </q-item-section>

              <q-item-section>
                Logout
              </q-item-section>
            </q-item>
          </q-list>
        </q-scroll-area>

        <q-img class="absolute-top" src="foodpics/004.jpg" dimmed style="height: 150px">
          <div class="absolute-bottom bg-transparent">
            <q-avatar size="56px" class="q-mb-sm">
              <img src="https://cdn.quasar.dev/img/boy-avatar.png">
            </q-avatar>
            <div class="text-weight-bold"> 
              {{ $store.$state.user ? `${$store.$state.user.name} ${$store.$state.user.surname}` : 'Profile' }}
            </div>
            <div>{{ $store.$state.user?.email || '@email'}}</div>
          </div>
        </q-img>
      </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
  <q-dialog persistent v-model="showTimeModal" style="width: 500px">
    <OpeningTimes @cancel-times="showTimeModal = false" />
  </q-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { router } from '../router'
import { useStore } from '../stores/userStore'
import OpeningTimes from 'src/components/OpeningTimes.vue'


const $store = useStore()

const leftDrawerOpen = ref(false)
const showTimeModal = ref(false)

function toggleLeftDrawer () {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

function goTo(routeName: string) {
  router.push({name: routeName})
}

function logout() {
  $store.setUser(null)
  goTo('login')
}

</script>
