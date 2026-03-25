import express from 'express'
import { register, login, logout, updateProfile } from '../controllers/authController.js'
import { verifyToken } from '../middleware/verifyToken.js'

const router = express.Router()

router.post('/register',       register)
router.post('/login',          login)
router.post('/logout',         verifyToken, logout)
router.put('/profile',         verifyToken, updateProfile)

export default router