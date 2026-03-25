import { useEffect, useState, useRef, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { io } from 'socket.io-client'
import { axiosInstance } from '../api/axiosInstance'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'
import EmojiPicker from 'emoji-picker-react'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'

// Component: Unified Read Receipts
const MessageStatus = ({ msg, currentUserId, isDarkMode }) => {
  if (msg.userId !== currentUserId) return null
  const seen = msg.seen?.filter(id => id !== currentUserId).length > 0
  const delivered = msg.delivered?.filter(id => id !== currentUserId).length > 0

  return (
    <div className="flex -space-x-1 ml-2">
      <span className={`text-[10px] transition-colors ${seen ? 'text-cyan-400' : delivered ? 'text-slate-400' : 'text-slate-600'}`}>●</span>
      <span className={`text-[10px] transition-colors ${seen ? 'text-cyan-400' : delivered ? 'text-slate-400' : 'text-transparent'}`}>●</span>
    </div>
  )
}

const ChatRoom = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { currentUser } = useAuthStore()
  
  // States
  const [room, setRoom] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [showEmoji, setShowEmoji] = useState(false)

  const socketRef = useRef(null)
  const bottomRef = useRef(null)
  const emojiContainerRef = useRef(null)

  // Search Logic (Filters both text and filenames)
  const filteredMessages = useMemo(() => {
    if (!searchQuery.trim()) return messages;
    const q = searchQuery.toLowerCase();
    return messages.filter(m => 
      m.text?.toLowerCase().includes(q) || 
      m.fileName?.toLowerCase().includes(q)
    )
  }, [messages, searchQuery])

  useEffect(() => {
    const init = async () => {
      try {
        const [roomRes, msgRes] = await Promise.all([
          axiosInstance.get(`/rooms/${id}`),
          axiosInstance.get(`/messages/${id}`)
        ])
        setRoom(roomRes.data)
        setMessages(msgRes.data)
      } catch (err) { navigate('/') }
    }
    init()

    socketRef.current = io(SOCKET_URL, { withCredentials: true })
    socketRef.current.emit('joinRoom', { roomId: id, userId: currentUser._id })
    socketRef.current.emit('markSeen', { roomId: id, userId: currentUser._id })

    socketRef.current.on('newMessage', (msg) => {
      setMessages(prev => [...prev, msg])
      socketRef.current.emit('markSeen', { roomId: id, userId: currentUser._id })
    })

    socketRef.current.on('messagesUpdated', (updated) => setMessages(updated))

    return () => socketRef.current.disconnect()
  }, [id, navigate, currentUser._id])

  useEffect(() => {
    if (!searchQuery) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, searchQuery])

  const handleSend = () => {
    if (!input.trim()) return
    socketRef.current.emit('sendMessage', {
      roomId: id, userId: currentUser._id, username: currentUser.username,
      avatar: currentUser.avatar, text: input.trim()
    })
    setInput('')
    setShowEmoji(false)
  }

  const handleFile = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) return toast.error("File limit 10MB")

    setUploading(true)
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = async () => {
      try {
        const res = await axiosInstance.post('/messages/upload', { file: reader.result })
        socketRef.current.emit('sendFile', {
          roomId: id, userId: currentUser._id, username: currentUser.username,
          avatar: currentUser.avatar, fileUrl: res.data.url, fileType: res.data.type, fileName: file.name
        })
      } catch (err) { toast.error('Upload failed') }
      finally { setUploading(false) }
    }
  }

  const downloadFile = (url) => {
    const safeUrl = url.replace('/upload/', '/upload/fl_attachment/');
    const link = document.createElement('a');
    link.href = safeUrl; link.target = '_blank';
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  return (
    <div className={`flex flex-col h-screen transition-colors duration-500 font-sans ${
      isDarkMode ? 'bg-[#121826] text-slate-100' : 'bg-[#f8fafc] text-slate-900'
    }`}>
      
      {/* Dynamic Header */}
      <header className={`z-20 backdrop-blur-xl border-b px-6 py-4 flex items-center justify-between transition-all ${
        isDarkMode ? 'bg-[#121826]/80 border-white/5 shadow-2xl' : 'bg-white/80 border-slate-200 shadow-sm'
      }`}>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/')} className="p-2 hover:bg-black/10 rounded-full transition-all opacity-60">←</button>
          <div>
            <h2 className="text-sm font-black uppercase tracking-tighter">#{room?.name}</h2>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse shadow-[0_0_5px_cyan]" />
              <p className="text-[9px] text-cyan-500 font-bold uppercase tracking-widest">Active Link</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className={`flex items-center transition-all duration-300 overflow-hidden rounded-xl ${
            showSearch ? 'w-48 md:w-64 px-3 py-1.5 bg-black/5' : 'w-0'
          }`}>
            <input 
              placeholder="Search history..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-xs w-full placeholder:text-slate-500"
            />
          </div>
          <button onClick={() => { setShowSearch(!showSearch); setSearchQuery(''); }} className="p-2 opacity-60 hover:opacity-100 transition-opacity">
            {showSearch ? '✕' : '🔍'}
          </button>
          <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 text-lg hover:scale-110 transition-transform">
            {isDarkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      {/* Message Feed */}
      <main className="flex-1 overflow-y-auto px-6 py-8 flex flex-col gap-8 custom-scrollbar relative">
        {filteredMessages.map((msg, i) => {
          const isMe = msg.userId === currentUser._id;
          const isPDF = msg.fileUrl?.toLowerCase().endsWith('.pdf');
          
          return (
            <div key={msg._id || i} className={`flex ${isMe ? 'justify-end' : 'justify-start'} group`}>
              <div className={`flex gap-4 max-w-[75%] ${isMe ? 'flex-row-reverse' : ''}`}>
                <div className={`w-9 h-9 rounded-2xl flex items-center justify-center text-[10px] font-black shrink-0 shadow-lg border border-white/5 ${
                  isMe ? 'bg-linear-to-br from-cyan-600 to-blue-700 text-white' : (isDarkMode ? 'bg-slate-800' : 'bg-white border-slate-200 text-slate-400')
                }`}>
                  {msg.avatar ? <img src={msg.avatar} className="w-full h-full object-cover rounded-2xl" alt="" /> : msg.username?.charAt(0)}
                </div>

                <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  {msg.text && (
                    <div className={`px-5 py-3 rounded-3xl text-[13px] leading-relaxed shadow-xl border transition-all ${
                      isMe 
                      ? 'bg-cyan-600 border-cyan-500 text-white rounded-tr-none' 
                      : (isDarkMode ? 'bg-white/5 border-white/5 text-slate-200 rounded-tl-none' : 'bg-white border-slate-200 text-slate-700 rounded-tl-none')
                    }`}>
                      {searchQuery ? (
                        <span dangerouslySetInnerHTML={{ 
                          __html: msg.text.replace(new RegExp(`(${searchQuery})`, 'gi'), '<mark class="bg-yellow-400 text-black">$1</mark>') 
                        }} />
                      ) : msg.text}
                    </div>
                  )}

                  {msg.fileUrl && (
                    <div className="mt-2 rounded-2xl border border-white/5 shadow-2xl overflow-hidden group/file">
                      {(msg.fileType === 'image' && !isPDF) ? (
                        <img src={msg.fileUrl} className="max-w-xs cursor-zoom-in hover:scale-[1.02] transition-transform" onClick={() => window.open(msg.fileUrl, '_blank')} alt="Attachment" />
                      ) : (
                        <div className={`p-4 flex items-center gap-4 w-64 ${isDarkMode ? 'bg-white/5 backdrop-blur-xl' : 'bg-slate-100'}`}>
                          <div className="w-10 h-10 bg-cyan-500/20 text-cyan-500 rounded-xl flex items-center justify-center text-xl">📄</div>
                          <div className="flex-1 overflow-hidden">
                            <p className="text-[11px] font-black truncate uppercase tracking-tighter">{msg.fileName || "Transmission_Data"}</p>
                            <button onClick={() => downloadFile(msg.fileUrl)} className="text-[9px] font-black text-cyan-500 mt-1 uppercase hover:underline">Download</button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center mt-2 px-1">
                    <span className="text-[9px] text-slate-500 font-bold tracking-tighter">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <MessageStatus msg={msg} currentUserId={currentUser._id} isDarkMode={isDarkMode} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </main>

      {/* Signature Input Footer */}
      <footer className="px-6 py-6 z-20">
        <div className={`max-w-5xl mx-auto flex items-center gap-3 p-2 rounded-[30px] border shadow-2xl transition-all ${
          isDarkMode ? 'bg-white/5 border-white/10 focus-within:border-cyan-500/30' : 'bg-white border-slate-200 focus-within:border-cyan-500/30'
        }`} ref={emojiContainerRef}>
          
          <div className="flex items-center ml-2">
            <label className="p-3 text-slate-500 hover:text-cyan-500 cursor-pointer transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
              <input type="file" onChange={handleFile} className="hidden" />
            </label>
            <button onClick={() => setShowEmoji(!showEmoji)} className={`p-3 transition-colors ${showEmoji ? 'text-cyan-500' : 'text-slate-500 hover:text-slate-300'}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </button>
          </div>

          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={uploading ? "Encrypting transmission..." : "Enter data pack..."}
            className="flex-1 bg-transparent border-none outline-none text-sm px-2 py-3 placeholder:text-slate-600"
          />

          <button onClick={handleSend} disabled={!input.trim()} className="bg-cyan-500 hover:bg-cyan-400 disabled:opacity-20 text-slate-900 px-8 py-3 rounded-[22px] text-[10px] font-black uppercase tracking-widest shadow-lg shadow-cyan-500/20 active:scale-95 transition-all">
            Execute
          </button>
        </div>
      </footer>

      {showEmoji && (
        <div className="absolute bottom-28 left-6 z-50 rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
          <EmojiPicker theme={isDarkMode ? 'dark' : 'light'} width={320} height={400} skinTonesDisabled onEmojiClick={(d) => setInput(prev => prev + d.emoji)} />
        </div>
      )}
    </div>
  )
}

export default ChatRoom