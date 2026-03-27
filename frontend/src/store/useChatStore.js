import { create } from "zustand";
import { io } from "socket.io-client";
import { axiosInstance } from "../lib/axiosInstance";
import { useAuthStore } from "./authStore";

const SOCKET_URL = (import.meta.env.VITE_SOCKET_URL || "http://localhost:5000").trim();

export const useChatStore = create((set, get) => ({
  messages: [],
  socket: null,
  isLoadingMessages: false,
  isSendingMessage: false,

  getMessages: async (roomId) => {
    if (!roomId) return;

    set({ isLoadingMessages: true });
    try {
      const res = await axiosInstance.get(`/messages/${roomId}`);
      set({ messages: res.data });
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    } finally {
      set({ isLoadingMessages: false });
    }
  },

  connectSocket: (roomId) => {
    const { currentUser } = useAuthStore.getState();
    if (!currentUser || !roomId) return;

    if (get().socket) get().socket.disconnect();

    const socket = io(SOCKET_URL, { withCredentials: true });

    socket.emit("joinRoom", { roomId });
    socket.emit("markSeen", { roomId, userId: currentUser._id });

    socket.on("newMessage", (msg) => {
      set((state) => ({ messages: [...state.messages, msg] }));
      socket.emit("markSeen", { roomId, userId: currentUser._id });
    });

    socket.on("messagesSeen", ({ userId }) => {
      set((state) => ({
        messages: state.messages.map((message) =>
          message.seen.includes(userId)
            ? message
            : { ...message, seen: [...message.seen, userId] }
        ),
      }));
    });

    set({ socket });
  },

  sendTextMessage: async (roomId, text, attachment = null) => {
    const { currentUser } = useAuthStore.getState();
    const { socket } = get();

    if (!currentUser || !socket || !roomId) return;

    set({ isSendingMessage: true });

    try {
      let uploadedFile = null;
      if (attachment) {
        const res = await axiosInstance.post("/messages/upload", {
          file: attachment.base64,
          name: attachment.name,
          size: attachment.size,
        });
        uploadedFile = res.data;
      }

      socket.emit("sendMessage", {
        roomId,
        userId: currentUser._id,
        username: currentUser.username,
        avatar: currentUser.avatar,
        text,
        fileUrl: uploadedFile?.url || null,
        downloadUrl: uploadedFile?.downloadUrl || null,
        fileType: uploadedFile?.fileType || null,
        fileName: uploadedFile?.fileName || null,
        fileSize: uploadedFile?.fileSize || null,
      });
    } finally {
      set({ isSendingMessage: false });
    }
  },

  disconnectSocket: () => {
    const { socket } = get();
    if (socket) socket.disconnect();
    set({ socket: null });
  },
}));
