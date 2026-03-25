import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { axiosInstance } from '../api/axiosInstance'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'

const Home = () => {
  const { currentUser, logout } = useAuthStore()
  const navigate = useNavigate()
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ name: '', description: '' })
  
  // Theme State
  const [isDarkMode, setIsDarkMode] = useState(true)

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await axiosInstance.get('/rooms')
        setRooms(res.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchRooms()
  }, [])

  const handleLogout = async () => {
    try {
      await axiosInstance.post('/auth/logout')
      logout()
      navigate('/login')
    } catch (err) {
      console.error(err)
    }
  }

  const Logo = () => (
  <svg width="40" height="40" viewBox="0 0 100 100" fill="none">
    <path d="M50 15L85 50L50 85L15 50L50 15Z" stroke="#06b6d4" strokeWidth="8" strokeLinejoin="round"/>
    <circle cx="50" cy="50" r="10" fill="white" className="animate-pulse" />
  </svg>
)

  return (
    <div className={`min-h-screen transition-colors duration-500 font-sans ${
      isDarkMode ? 'bg-[#121826] text-slate-100' : 'bg-[#f8fafc] text-slate-900'
    }`}>
      
      {/* Dynamic Background Glows */}
      <div className={`fixed top-[-10%] left-[-10%] w-[40%] h-[40%] blur-[120px] rounded-full pointer-events-none opacity-20 ${
        isDarkMode ? 'bg-cyan-500' : 'bg-cyan-300'
      }`} />
      <div className={`fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] blur-[120px] rounded-full pointer-events-none opacity-20 ${
        isDarkMode ? 'bg-indigo-500' : 'bg-indigo-300'
      }`} />

      {/* Navbar */}
      <nav className={`sticky top-0 z-40 backdrop-blur-xl border-b px-8 py-4 flex items-center justify-between transition-all ${
        isDarkMode ? 'bg-[#121826]/70 border-white/5 shadow-2xl' : 'bg-white/70 border-slate-200 shadow-sm'
      }`}>
        <div className="flex items-center gap-4">
          <Logo />
          <h1 className="text-xl font-black tracking-tighter uppercase">
            SPECTRE <span className="text-cyan-500">CHAT</span>
          </h1>
        </div>

        <div className="flex items-center gap-4">
          {/* Theme Toggle Button */}
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-2.5 rounded-xl transition-all border ${
              isDarkMode ? 'bg-white/5 border-white/10 text-yellow-400 hover:bg-white/10' : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>

          <div className="h-8 w-px bg-slate-200/20 mx-2 hidden md:block" />

          <button onClick={() => navigate('/profile')} className="hidden md:block text-sm font-bold opacity-60 hover:opacity-100 transition-opacity">
            PROFILE
          </button>
          
          <button onClick={handleLogout} className={`text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-xl transition-all border ${
            isDarkMode ? 'border-red-500/30 text-red-400 hover:bg-red-500/10' : 'border-red-200 text-red-600 hover:bg-red-50'
          }`}>
            DISCONNECT
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-8 py-16 relative z-10">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div>
            <h2 className="text-5xl font-black tracking-tighter uppercase mb-4">
              Network <span className="text-cyan-500">Nodes</span>
            </h2>
            <p className={`text-sm font-medium tracking-wide max-w-md ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Access secure communication channels. All transmissions are encrypted and logged per protocol.
            </p>
          </div>
          <button onClick={() => setShowCreate(true)}
            className="bg-cyan-500 hover:bg-cyan-400 text-slate-900 px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all shadow-xl shadow-cyan-500/20 active:scale-95">
            + Initialize New Node
          </button>
        </header>

        {/* Room Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className={`h-40 rounded-4xl animate-pulse ${isDarkMode ? 'bg-white/5' : 'bg-slate-200'}`} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map(room => (
              <div key={room._id}
                onClick={() => navigate(`/room/${room._id}`)}
                className={`group relative p-8 rounded-4xl border transition-all duration-300 cursor-pointer flex flex-col justify-between h-48 ${
                  isDarkMode 
                  ? 'bg-white/5 border-white/5 hover:border-cyan-500/40 hover:bg-white/8' 
                  : 'bg-white border-slate-200 hover:border-cyan-500/40 hover:shadow-xl hover:shadow-cyan-500/5'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className={`font-black text-xl tracking-tight uppercase group-hover:text-cyan-500 transition-colors ${
                      isDarkMode ? 'text-white' : 'text-slate-800'
                    }`}>
                      #{room.name}
                    </h3>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-all ${
                      isDarkMode ? 'bg-cyan-500/20 text-cyan-400' : 'bg-cyan-100 text-cyan-600'
                    }`}>→</div>
                  </div>
                  <p className={`text-xs font-medium leading-relaxed line-clamp-2 ${
                    isDarkMode ? 'text-slate-400' : 'text-slate-500'
                  }`}>
                    {room.description || 'Standard secure data frequency.'}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-current border-opacity-5">
                  <span className={`text-[10px] font-bold tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                    {room.members.length} IDENTITIES
                  </span>
                  <div className="flex -space-x-2">
                    {[...Array(Math.min(room.members.length, 3))].map((_, i) => (
                      <div key={i} className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-[8px] font-black ${
                        isDarkMode ? 'bg-slate-800 border-[#121826]' : 'bg-slate-100 border-white text-slate-400'
                      }`}>
                        {room.members[i]?.username?.charAt(0) || 'U'}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal Overlay */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-md bg-slate-900/40">
           <div className={`w-full max-w-md p-10 rounded-[40px] border shadow-2xl animate-in fade-in zoom-in-95 ${
             isDarkMode ? 'bg-[#1a2131] border-white/10' : 'bg-white border-slate-200'
           }`}>
              <h3 className="text-2xl font-black uppercase tracking-tighter mb-8">Establish Node</h3>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-50 ml-1">Node Identifier</label>
                  <input placeholder="Enter name..." className={`w-full px-5 py-4 rounded-2xl outline-none border transition-all ${
                    isDarkMode ? 'bg-white/5 border-white/10 focus:border-cyan-500/50' : 'bg-slate-50 border-slate-200 focus:border-cyan-500/50'
                  }`} />
                </div>
                <div className="flex gap-4 pt-4">
                  <button className="flex-1 bg-cyan-500 text-slate-900 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest">Execute</button>
                  <button onClick={() => setShowCreate(false)} className={`flex-1 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest ${
                    isDarkMode ? 'bg-white/5 text-slate-400' : 'bg-slate-100 text-slate-500'
                  }`}>Abort</button>
                </div>
              </div>
           </div>
        </div>
      )}
    </div>
  )
}

export default Home