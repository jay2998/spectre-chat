import Message from '../models/Message.js'
import { v2 as cloudinary } from 'cloudinary'
import dotenv from 'dotenv'
dotenv.config()

// Configure Cloudinary with your environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

/**
 * Fetches the last 100 messages for a specific room
 */
export const getMessages = async (req, res) => {
  try {
    const { roomId } = req.params
    const messages = await Message.find({ roomId })
      .sort({ createdAt: 1 }) // Oldest first for chat flow
      .limit(100)
    
    res.status(200).json(messages)
  } catch (err) {
    console.error("Fetch Messages Error:", err)
    res.status(500).json('Something went wrong while fetching messages.')
  }
}

/**
 * Uploads a base64 file string to Cloudinary
 * Uses resource_type: 'auto' to support PDFs, Docs, and Images
 */
export const uploadFile = async (req, res) => {
  try {
    const { file } = req.body

    if (!file) {
      return res.status(400).json('No file provided.')
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(file, {
      folder: 'chat-files',
      resource_type: 'auto', // Detects if it's 'image' or 'raw' (PDF/Docs)
    })

    // LOGGING: Check your VS Code terminal to see what Cloudinary detected
    console.log(`--- File Uploaded ---`);
    console.log(`URL: ${result.secure_url}`);
    console.log(`Type: ${result.resource_type}`); // Should be 'raw' for PDFs
    console.log(`---------------------`);

    res.status(200).json({
      url: result.secure_url, 
      type: result.resource_type, // 'image', 'raw', or 'video'
    })
  } catch (err) {
    console.error("Cloudinary Upload Error Details:", err)
    res.status(500).json('File upload failed. Check server logs for details.')
  }
}