import { defineStore } from 'pinia'
import { ref } from 'vue'
import User from 'src/models/User'
import Time from 'src/models/Time'

export const useStore = defineStore('main', () => {
    const user = ref<User | null>(null)
    const openingTimes = ref<Time | null>(null)
    const setUser = (data: User | null) => user.value = data
    const setTime = (data: Time | null) => openingTimes.value = data
    return { user, openingTimes, setUser, setTime }
  },
  { persist: { enabled: true }}
)