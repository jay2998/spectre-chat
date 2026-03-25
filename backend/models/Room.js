import mongoose from 'mongoose'

const roomSchema = new mongoose.Schema({
  name:        { type: String, required: true, unique: true },
  description: { type: String, default: '' },
  createdBy:   { type: String, required: true },
  members:     { type: [String], default: [] },
}, { timestamps: true })

export default mongoose.model('Room', roomSchema)