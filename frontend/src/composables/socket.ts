import { io } from 'socket.io-client'

export default function IO() {
  const socket = import.meta.env.PROD ? io() : io('http://localhost:4000')
  return { socket }
}
