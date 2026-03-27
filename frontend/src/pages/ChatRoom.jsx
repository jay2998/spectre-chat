import { useEffect, useRef, useState } from "react";
import EmojiPicker from "emoji-picker-react";
import { useParams } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useChatStore } from "../store/useChatStore";

const ChatRoom = () => {
  const { id } = useParams();
  const { currentUser } = useAuthStore();
  const {
    messages,
    getMessages,
    connectSocket,
    disconnectSocket,
    sendTextMessage,
    isLoadingMessages,
  } = useChatStore();

  const [input, setInput] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [imgPreview, setImgPreview] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    getMessages(id);
    connectSocket(id);

    return () => disconnectSocket();
  }, [id, getMessages, connectSocket, disconnectSocket]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() && !imgPreview) return;

    sendTextMessage(id, input, imgPreview);
    setInput("");
    setImgPreview(null);
    setShowEmoji(false);
  };

  return (
    <div className="flex h-screen flex-col bg-slate-950 text-white">
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {isLoadingMessages && <p className="text-sm text-slate-400">Loading messages...</p>}
        {messages.map((message) => (
          <div
            key={message._id}
            className={`flex ${message.userId === currentUser._id ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-xl p-3 ${
                message.userId === currentUser._id ? "bg-indigo-600" : "bg-slate-800"
              }`}
            >
              {message.fileUrl && (
                <img src={message.fileUrl} className="mb-2 max-h-60 rounded" alt="Attachment" />
              )}
              {message.text && <p>{message.text}</p>}
              {message.userId === currentUser._id && (
                <div className="mt-1 text-right text-[10px] opacity-50">
                  {message.seen?.length > 1 ? "Read" : "Sent"}
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>

      <div className="relative border-t border-slate-800 bg-slate-900 p-4">
        {showEmoji && (
          <div className="absolute bottom-20 z-50">
            <EmojiPicker
              onEmojiClick={(emojiData) => setInput((prev) => prev + emojiData.emoji)}
              theme="dark"
            />
          </div>
        )}
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => setShowEmoji((prev) => !prev)}>
            :)
          </button>
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && handleSend()}
            className="flex-1 rounded-xl bg-slate-800 p-3 outline-none"
            placeholder="Message..."
          />
          <button type="button" onClick={handleSend} className="rounded-xl bg-indigo-600 px-6 py-3">
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;
