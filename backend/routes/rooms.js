import express from 'express'
import { createRoom, getRooms, getRoom, joinRoom } from '../controllers/roomController.js'
import { verifyToken } from '../middleware/verifyToken.js'

const router = express.Router()

router.post('/',       verifyToken, createRoom)
router.get('/',        getRooms)
router.get('/:id',     getRoom)
router.put('/:id/join', verifyToken, joinRoom)

export default router