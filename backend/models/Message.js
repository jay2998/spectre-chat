import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  roomId: { type: String, required: true },
  userId: { type: String, required: true },
  username: { type: String, required: true },
  avatar: { type: String },
  text: { type: String },
  fileUrl: { type: String },
  fileType: { type: String }, // 'image', 'video', or 'raw'
  seen: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Array of user IDs
}, { timestamps: true });

export default mongoose.model("Message", messageSchema);