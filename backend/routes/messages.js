import express from 'express';
import { getMessages, uploadFile, sendMessage } from '../controllers/messageController.js';

const router = express.Router();

// GET history
router.get('/:roomId', getMessages);

// POST upload (Cloudinary)
router.post('/upload', uploadFile);

// POST send (Database)
router.post('/send', sendMessage);

export default router;