import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import { createServer } from 'http'
import { Server } from 'socket.io'
import authRoutes from './routes/auth.js'
import roomRoutes from './routes/rooms.js'
import messageRoutes from './routes/messages.js'
import Message from './models/Message.js'
import User from './models/User.js'

dotenv.config()
const app = express()
const httpServer = createServer(app)

// Socket.io Setup with Credentials support
const io = new Server(httpServer, {
  cors: { 
    origin: ["http://localhost:5173", "http://localhost:5174"], // Added both common Vite ports
    credentials: true 
  }
})

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  process.env.CLIENT_URL,
]

// CORS Middleware
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
}))

// Middleware - IMPORTANT: cookieParser must be before routes
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ limit: '10mb', extended: true }))
app.use(cookieParser())

// Routes
app.use('/api/auth',     authRoutes)
app.use('/api/rooms',    roomRoutes)
app.use('/api/messages', messageRoutes)

app.get('/', (req, res) => res.json('Chat backend running!'))

// Socket Logic
io.on('connection', (socket) => {
  console.log('User connected:', socket.id)

  // Join room
  socket.on('joinRoom', async ({ roomId, userId, username }) => {
    socket.join(roomId)
    socket.data.userId = userId
    socket.data.username = username
    socket.to(roomId).emit('userJoined', { username })

    try {
      await Message.updateMany(
        { roomId, delivered: { $ne: userId } },
        { $addToSet: { delivered: userId } }
      )
      const updated = await Message.find({ roomId }).sort({ createdAt: 1 }).limit(100)
      io.to(roomId).emit('messagesUpdated', updated)
    } catch (err) {
      console.error(err)
    }
  })

  // Leave room
  socket.on('leaveRoom', ({ roomId, username }) => {
    socket.leave(roomId)
    socket.to(roomId).emit('userLeft', { username })
  })

  // Send text message
  socket.on('sendMessage', async ({ roomId, userId, username, avatar, text }) => {
    try {
      const message = new Message({
        roomId, userId, username, avatar, text,
        delivered: [userId],
        seen: [userId],
      })
      const saved = await message.save()

      const socketsInRoom = await io.in(roomId).fetchSockets()
      const userIdsInRoom = socketsInRoom
        .map(s => s.data.userId)
        .filter(id => id && id !== userId)

      if (userIdsInRoom.length > 0) {
        await Message.findByIdAndUpdate(saved._id, {
          $addToSet: { delivered: { $each: userIdsInRoom } }
        })
      }

      const final = await Message.findById(saved._id)
      io.to(roomId).emit('newMessage', final)
    } catch (err) {
      console.error(err)
    }
  })

  // Send file - UPDATED to include fileName
  socket.on('sendFile', async ({ roomId, userId, username, avatar, fileUrl, fileType, fileName }) => {
    try {
      const message = new Message({
        roomId, 
        userId, 
        username, 
        avatar, 
        fileUrl, 
        fileType,
        fileName, // Now saving the original filename (e.g., resume.pdf)
        delivered: [userId],
        seen: [userId],
      })
      const saved = await message.save()
      io.to(roomId).emit('newMessage', saved)
    } catch (err) {
      console.error("Socket sendFile Error:", err)
    }
  })

  // Mark messages as seen
  socket.on('markSeen', async ({ roomId, userId }) => {
    try {
      await Message.updateMany(
        { roomId, seen: { $ne: userId } },
        { $addToSet: { seen: userId } }
      )
      const updated = await Message.find({ roomId }).sort({ createdAt: 1 }).limit(100)
      io.to(roomId).emit('messagesUpdated', updated)
    } catch (err) {
      console.error(err)
    }
  })

  // Typing
  socket.on('typing', ({ roomId, username }) => {
    socket.to(roomId).emit('userTyping', { username })
  })

  socket.on('stopTyping', ({ roomId, username }) => {
    socket.to(roomId).emit('userStopTyping', { username })
  })

  // Online status
  socket.on('setOnline', async ({ userId }) => {
    try {
      await User.findByIdAndUpdate(userId, { isOnline: true })
      io.emit('onlineStatus', { userId, isOnline: true })
    } catch (err) {
      console.error(err)
    }
  })

  socket.on('disconnect', async () => {
    const userId = socket.data.userId
    if (userId) {
      try {
        await User.findByIdAndUpdate(userId, {
          isOnline: false,
          lastSeen: Date.now()
        })
        io.emit('onlineStatus', { userId, isOnline: false })
      } catch (err) {
        console.error(err)
      }
    }
  })
})

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected')
    httpServer.listen(process.env.PORT, () =>
      console.log(`Server on port ${process.env.PORT}`)
    )
  })
  .catch((err) => console.error(err))