import Message from "../models/Message.js";
import cloudinary from "../lib/cloudinary.js";

export const uploadFile = async (req, res) => {
  try {
    const { file, name, size } = req.body;
    if (!file) return res.status(400).json({ error: "No file provided" });

    const uploadResponse = await cloudinary.uploader.upload(file, {
      folder: "chat_app_uploads",
      resource_type: "auto",
    });

    const fileType =
      uploadResponse.resource_type === "image"
        ? "image"
        : uploadResponse.resource_type === "video"
          ? "video"
          : "file";

    res.status(200).json({
      url: uploadResponse.secure_url,
      fileType,
      fileName: name || uploadResponse.original_filename,
      fileSize: size || uploadResponse.bytes,
    });
  } catch (error) {
    console.error("Cloudinary Error:", error);
    res.status(500).json({ error: "Upload failed" });
  }
};

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
    const { text, fileUrl, fileType, fileName, fileSize, roomId, username, avatar } = req.body;
    const newMessage = new Message({
      roomId,
      userId: req.userId,
      username,
      avatar,
      text,
      fileUrl,
      fileType,
      fileName,
      fileSize,
      seen: [req.userId],
    });
    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};
