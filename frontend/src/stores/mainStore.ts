import { defineStore } from 'pinia'
import { ref } from 'vue'
import User from 'src/models/User'
import Time from 'src/models/Time'

export const useStore = defineStore('main', () => {
    const user = ref<User | null>(null)
    const openingTimes = ref<Time>({
      _id: null,
      opening_hour: 0,
      closing_hour: 0,
      days_open: []
    })
    const setUser = (data: User | null) => user.value = data
    const setTime = (data: Time = {
      _id: null,
      opening_hour: 0,
      closing_hour: 0,
      days_open: []
    }) => openingTimes.value = data
    return { user, openingTimes, setUser, setTime }
  },
  { persist: { enabled: true }}
)