import httpSocketServer from './src/socket/v1'

httpSocketServer.listen(process.env.SOCKET_IO_PORT, () =>
  console.log(`socket server listening on port ${process.env.SOCKET_IO_PORT}`)
)