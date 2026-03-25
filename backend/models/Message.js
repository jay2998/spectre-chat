import mongoose from 'mongoose'

const messageSchema = new mongoose.Schema({
  roomId:    { type: String, required: true },
  userId:    { type: String, required: true },
  username:  { type: String, required: true },
  avatar:    { type: String, default: '' },
  text:      { type: String, default: '' },
  fileUrl:   { type: String, default: '' },
  fileType:  { type: String, default: '' },
  delivered: { type: [String], default: [] }, 
  seen:      { type: [String], default: [] },  
}, { timestamps: true })

export default mongoose.model('Message', messageSchema)