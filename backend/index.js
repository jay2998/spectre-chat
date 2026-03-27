import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import { Server } from "socket.io";
import authRoutes from "./routes/auth.js";
import roomRoutes from "./routes/rooms.js";
import messageRoutes from "./routes/messages.js";
import Message from "./models/Message.js";

dotenv.config();

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 5000;
const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:5173",
  "http://localhost:5174",
].filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

const io = new Server(httpServer, {
  cors: { origin: allowedOrigins, credentials: true },
});

io.on("connection", (socket) => {
  socket.on("joinRoom", ({ roomId }) => socket.join(roomId));

  socket.on("sendMessage", async (data) => {
    try {
      const newMessage = new Message({ ...data, seen: [data.userId] });
      await newMessage.save();
      io.to(data.roomId).emit("newMessage", newMessage);
    } catch (error) {
      console.error(error);
    }
  });

  socket.on("markSeen", async ({ roomId, userId }) => {
    try {
      await Message.updateMany(
        { roomId, seen: { $ne: userId } },
        { $push: { seen: userId } }
      );
      io.to(roomId).emit("messagesSeen", { roomId, userId });
    } catch (error) {
      console.error(error);
    }
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/messages", messageRoutes);

const MONGO_URI = process.env.MONGO_URI || process.env.MONGO_URL;
mongoose.connect(MONGO_URI).then(() => {
  httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
