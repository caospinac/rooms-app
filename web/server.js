const express = require('express')
const app = express()
const server = require('http').Server(app)
const socket = require('socket.io')
const io = socket(server)

io.on('connection', socket => {
  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId)
    socket.broadcast.to(roomId).emit('user-connected', userId)

    socket.on('disconnect', () => {
      socket.broadcast.to(roomId).emit('user-disconnected', userId)
    })
  })
})

app.get('/ping', (_req, res) => {
  res.send('pong')
})

server.listen(8080)
