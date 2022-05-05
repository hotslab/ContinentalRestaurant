
import { io } from 'socket.io-client'

export default function IO() {
  // const options = {
  //   reconnectionDelayMax: 10000,
  //   auth: null,
  //   query: null,
  // }
  const socket = io('ws://localhost:4000')
  return { socket }
}
