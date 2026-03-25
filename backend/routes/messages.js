import express from 'express'
import { getMessages, uploadFile } from '../controllers/messageController.js'
import { verifyToken } from '../middleware/verifyToken.js'

const router = express.Router()

router.get('/:roomId',  getMessages)
router.post('/upload',  verifyToken, uploadFile)

export default router