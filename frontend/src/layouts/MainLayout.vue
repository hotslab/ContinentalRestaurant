<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          unelevated 
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
        <q-scroll-area v-if="$store.user" style="height: calc(100% - 150px); margin-top: 150px; border-right: 1px solid #ddd">
          <SideBar />  
        </q-scroll-area>
        <SideBar v-else />
        <q-img v-if="$store.user" class="absolute-top" @click="goToProfile()" :src="getRandonPic()" clickable dimmed style="height: 150px">
          <div class="absolute-bottom bg-transparent">
            <q-avatar size="56px" class="q-mb-sm">
              <img src="https://cdn.quasar.dev/img/boy-avatar.png">
            </q-avatar>
            <div class="text-weight-bold"> 
              {{ $store.user ? `${$store.user.name} ${$store.user.surname}` : 'Profile' }}
            </div>
            <div>{{ $store.user?.email || '@email'}}</div>
          </div>
        </q-img>
      </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useStore } from 'src/stores/mainStore'
import SideBar from 'src/components/SideBar.vue'
import { api } from 'src/boot/axios'
import { router } from 'src/router'

const leftDrawerOpen = ref(false)
const urlPath = `${location.protocol}//${location.hostname}${`:${location.port}` || ''}`
const pics = [
  `${urlPath}/foodpics/001.jpg`,
  `${urlPath}/foodpics/002.jpg`,
  `${urlPath}/foodpics/003.jpg`,
  `${urlPath}/foodpics/004.jpg`,
]

const $store = useStore()

function goToProfile(): void {
  router.push({name: 'user', params: {id: $store.user?._id }})
}
function toggleLeftDrawer(): void {
  leftDrawerOpen.value = !leftDrawerOpen.value
}
function getRandonPic(): string {
  return pics[Math.floor((Math.random()*pics.length))]
}
async function getTimes(): Promise<void> {
  await api.get('times').then(
    response => $store.setTime(response.data.time),
    error => console.log(error)
  )
}

onMounted(() => getTimes())
</script>
