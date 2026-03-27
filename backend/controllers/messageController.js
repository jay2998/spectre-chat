import Message from "../models/Message.js";
import cloudinary from "../lib/cloudinary.js";

// FIX: Exporting uploadFile stops the "Module not found" crash
export const uploadFile = async (req, res) => {
  try {
    const { file } = req.body;
    if (!file) return res.status(400).json({ error: "No file provided" });

    const uploadResponse = await cloudinary.uploader.upload(file, {
      folder: "chat_app_uploads",
    });

    res.status(200).json({ url: uploadResponse.secure_url });
  } catch (error) {
    console.error("Cloudinary Error:", error);
    res.status(500).json({ error: "Upload failed" });
  }
};

// FIX: Fetch history so messages don't disappear on login/refresh
export const getMessages = async (req, res) => {
  try {
    const { roomId } = req.params;
    const messages = await Message.find({ roomId }).sort({ createdAt: 1 });
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch messages" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, fileUrl, roomId, username, avatar } = req.body;
    const newMessage = new Message({
      roomId,
      userId: req.userId,
      username,
      avatar,
      text,
      fileUrl,
      seen: [req.userId],
    });
    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};