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
      bordered
    >
      <q-list>
        <q-item @click="goTo('login')" clickable>
          <q-item-section avatar>
            <q-icon name="login" />
          </q-item-section>

          <q-item-section>
            Login
          </q-item-section>
        </q-item>
        <q-item @click="goTo('register')" clickable>
          <q-item-section avatar>
            <q-icon name="how_to_reg" />
          </q-item-section>

          <q-item-section>
            Register
          </q-item-section>
        </q-item>
        <q-item @click="goTo('password-reset')" clickable>
          <q-item-section avatar>
            <q-icon name="lock_reset" />
          </q-item-section>

          <q-item-section>
            Password Reset
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { router } from '../router'

const leftDrawerOpen = ref(false)

function toggleLeftDrawer () {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

function goTo(routeName: string) {
  router.push({name: routeName})
}

</script>
