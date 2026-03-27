import { useEffect, useRef, useState } from "react";
import EmojiPicker from "emoji-picker-react";
import { useParams } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useChatStore } from "../store/useChatStore";

const formatMessageTime = (value) =>
  new Date(value).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });

const formatMessageDate = (value) =>
  new Date(value).toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const formatFileSize = (size = 0) => {
  if (!size) return null;
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

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
    isSendingMessage,
  } = useChatStore();

  const [input, setInput] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [attachment, setAttachment] = useState(null);
  const scrollRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    getMessages(id);
    connectSocket(id);

    return () => disconnectSocket();
  }, [id, getMessages, connectSocket, disconnectSocket]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() && !attachment) return;

    sendTextMessage(id, input, attachment);
    setInput("");
    setAttachment(null);
    setShowEmoji(false);
  };

  const handleFileSelect = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setAttachment({
        base64: reader.result,
        name: file.name,
        size: file.size,
        type: file.type,
        previewUrl: file.type.startsWith("image/") ? URL.createObjectURL(file) : null,
      });
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const clearAttachment = () => {
    if (attachment?.previewUrl) {
      URL.revokeObjectURL(attachment.previewUrl);
    }
    setAttachment(null);
  };

  return (
    <div className="flex h-screen flex-col bg-slate-950 text-white">
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {isLoadingMessages && <p className="text-sm text-slate-400">Loading messages...</p>}
        {messages.map((message, index) => {
          const previousMessage = messages[index - 1];
          const showDateDivider =
            !previousMessage ||
            formatMessageDate(previousMessage.createdAt) !== formatMessageDate(message.createdAt);
          const isOwnMessage = message.userId === currentUser._id;
          const hasBeenSeenByOthers = (message.seen || []).some((userId) => userId !== currentUser._id);

          return (
            <div key={message._id}>
              {showDateDivider && (
                <div className="my-4 flex items-center gap-3 text-xs text-slate-500">
                  <div className="h-px flex-1 bg-slate-800" />
                  <span>{formatMessageDate(message.createdAt)}</span>
                  <div className="h-px flex-1 bg-slate-800" />
                </div>
              )}
              <div className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl p-3 shadow-sm ${
                    isOwnMessage ? "bg-indigo-600" : "bg-slate-800"
                  }`}
                >
                  <div className="mb-2 flex items-center justify-between gap-3 text-xs">
                    <span className="font-semibold text-white/90">{message.username}</span>
                    <span className="text-white/60">{formatMessageTime(message.createdAt)}</span>
                  </div>

                  {message.fileUrl && message.fileType === "image" && (
                    <a href={message.fileUrl} target="_blank" rel="noreferrer">
                      <img src={message.fileUrl} className="mb-2 max-h-72 rounded-xl" alt={message.fileName || "Attachment"} />
                    </a>
                  )}

                  {message.fileUrl && message.fileType !== "image" && (
                    <div className="mb-2 rounded-xl border border-white/10 bg-black/10 px-3 py-2 text-sm">
                      <div>
                        <p className="font-medium">{message.fileName || "Attachment"}</p>
                        <p className="text-xs text-white/70">{formatFileSize(message.fileSize) || "Open file"}</p>
                      </div>
                      <div className="mt-3 flex gap-2">
                        <a
                          href={message.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-lg bg-white/10 px-3 py-1 text-xs uppercase tracking-wide text-white/80"
                        >
                          Open
                        </a>
                        <a
                          href={message.downloadUrl || message.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-lg bg-white/10 px-3 py-1 text-xs uppercase tracking-wide text-white/80"
                        >
                          Download
                        </a>
                      </div>
                    </div>
                  )}

                  {message.text && <p className="whitespace-pre-wrap">{message.text}</p>}

                  <div className="mt-2 flex items-center justify-between gap-3 text-[10px] text-white/60">
                    <span>{formatMessageDate(message.createdAt)}</span>
                    {isOwnMessage && <span>{hasBeenSeenByOthers ? "Read" : "Sent"}</span>}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={scrollRef} />
      </div>

      <div className="relative border-t border-slate-800 bg-slate-900 p-4">
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileSelect}
        />
        {showEmoji && (
          <div className="absolute bottom-20 z-50">
            <EmojiPicker
              onEmojiClick={(emojiData) => setInput((prev) => prev + emojiData.emoji)}
              theme="dark"
            />
          </div>
        )}
        {attachment && (
          <div className="mb-3 rounded-xl border border-slate-700 bg-slate-800 p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-white">{attachment.name}</p>
                <p className="text-xs text-slate-400">{formatFileSize(attachment.size) || "Ready to send"}</p>
              </div>
              <button type="button" onClick={clearAttachment} className="text-xs text-red-300">
                Remove
              </button>
            </div>
            {attachment.previewUrl && (
              <img src={attachment.previewUrl} alt={attachment.name} className="mt-3 max-h-40 rounded-lg" />
            )}
          </div>
        )}
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => setShowEmoji((prev) => !prev)}>
            :)
          </button>
          <button type="button" onClick={() => fileInputRef.current?.click()}>
            +
          </button>
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && handleSend()}
            className="flex-1 rounded-xl bg-slate-800 p-3 outline-none"
            placeholder="Message..."
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={isSendingMessage}
            className="rounded-xl bg-indigo-600 px-6 py-3 disabled:opacity-60"
          >
            {isSendingMessage ? "Sending..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;
