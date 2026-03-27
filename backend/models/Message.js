import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  roomId: { type: String, required: true },
  userId: { type: String, required: true },
  username: { type: String, required: true },
  avatar: { type: String },
  text: { type: String },
  fileUrl: { type: String },
  downloadUrl: { type: String },
  fileType: { type: String },
  fileName: { type: String },
  fileSize: { type: Number },
  seen: [{ type: String }],
}, { timestamps: true });

export default mongoose.model("Message", messageSchema);
