import { defineStore } from 'pinia'
import { ref } from 'vue'
import User from 'src/models/User'

export const useStore = defineStore('main', () => {
    const user = ref<User | null>(null)
    const setUser = (data: User | null) => user.value = data
    return { user, setUser }
  },
  { persist: { enabled: true }}
)