import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axiosInstance";
import { useAuthStore } from "../store/authStore";

const Home = () => {
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", description: "" });
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await axiosInstance.get("/rooms");
        setRooms(res.data);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load rooms");
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreateRoom = async () => {
    if (!form.name.trim()) {
      toast.error("Room name is required");
      return;
    }

    try {
      const res = await axiosInstance.post("/rooms", {
        name: form.name.trim(),
        description: form.description.trim(),
      });
      setRooms((prev) => [res.data, ...prev]);
      setForm({ name: "", description: "" });
      setShowCreate(false);
      toast.success("Room created");
      navigate(`/chat/${res.data._id}`);
    } catch (error) {
      toast.error(error.response?.data || "Failed to create room");
    }
  };

  const Logo = () => (
    <svg width="40" height="40" viewBox="0 0 100 100" fill="none">
      <path d="M50 15L85 50L50 85L15 50L50 15Z" stroke="#06b6d4" strokeWidth="8" strokeLinejoin="round" />
      <circle cx="50" cy="50" r="10" fill="white" className="animate-pulse" />
    </svg>
  );

  return (
    <div
      className={`min-h-screen font-sans text-slate-100 transition-colors duration-500 ${
        isDarkMode ? "bg-[#121826]" : "bg-[#f8fafc] text-slate-900"
      }`}
    >
      <div
        className={`pointer-events-none fixed left-[-10%] top-[-10%] h-[40%] w-[40%] rounded-full blur-[120px] opacity-20 ${
          isDarkMode ? "bg-cyan-500" : "bg-cyan-300"
        }`}
      />
      <div
        className={`pointer-events-none fixed bottom-[-10%] right-[-10%] h-[40%] w-[40%] rounded-full blur-[120px] opacity-20 ${
          isDarkMode ? "bg-indigo-500" : "bg-indigo-300"
        }`}
      />

      <nav
        className={`sticky top-0 z-40 flex items-center justify-between border-b px-8 py-4 backdrop-blur-xl transition-all ${
          isDarkMode ? "border-white/5 bg-[#121826]/70 shadow-2xl" : "border-slate-200 bg-white/70 shadow-sm"
        }`}
      >
        <div className="flex items-center gap-4">
          <Logo />
          <h1 className="text-xl font-black uppercase tracking-tighter">
            SPECTRE <span className="text-cyan-500">CHAT</span>
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setIsDarkMode((prev) => !prev)}
            className={`rounded-xl border p-2.5 transition-all ${
              isDarkMode
                ? "border-white/10 bg-white/5 text-yellow-400 hover:bg-white/10"
                : "border-slate-200 bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {isDarkMode ? "Sun" : "Moon"}
          </button>

          <div className="mx-2 hidden h-8 w-px bg-slate-200/20 md:block" />

          <button
            type="button"
            onClick={() => navigate("/profile")}
            className="hidden text-sm font-bold opacity-60 transition-opacity hover:opacity-100 md:block"
          >
            PROFILE
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className={`rounded-xl border px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
              isDarkMode ? "border-red-500/30 text-red-400 hover:bg-red-500/10" : "border-red-200 text-red-600 hover:bg-red-50"
            }`}
          >
            DISCONNECT
          </button>
        </div>
      </nav>

      <main className="relative z-10 mx-auto max-w-6xl px-8 py-16">
        <header className="mb-16 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <h2 className="mb-4 text-5xl font-black uppercase tracking-tighter">
              Network <span className="text-cyan-500">Nodes</span>
            </h2>
            <p
              className={`max-w-md text-sm font-medium tracking-wide ${
                isDarkMode ? "text-slate-400" : "text-slate-500"
              }`}
            >
              Access secure communication channels. All transmissions are encrypted and logged per protocol.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="rounded-2xl bg-cyan-500 px-8 py-4 text-[11px] font-black uppercase tracking-widest text-slate-900 shadow-xl shadow-cyan-500/20 transition-all hover:bg-cyan-400 active:scale-95"
          >
            + Initialize New Node
          </button>
        </header>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                className={`h-40 animate-pulse rounded-4xl ${isDarkMode ? "bg-white/5" : "bg-slate-200"}`}
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {rooms.map((room) => (
              <div
                key={room._id}
                onClick={() => navigate(`/chat/${room._id}`)}
                className={`group relative flex h-48 cursor-pointer flex-col justify-between rounded-4xl border p-8 transition-all duration-300 ${
                  isDarkMode
                    ? "border-white/5 bg-white/5 hover:border-cyan-500/40 hover:bg-white/8"
                    : "border-slate-200 bg-white hover:border-cyan-500/40 hover:shadow-xl hover:shadow-cyan-500/5"
                }`}
              >
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <h3
                      className={`text-xl font-black uppercase tracking-tight transition-colors group-hover:text-cyan-500 ${
                        isDarkMode ? "text-white" : "text-slate-800"
                      }`}
                    >
                      #{room.name}
                    </h3>
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-xs opacity-0 transition-all group-hover:opacity-100 ${
                        isDarkMode ? "bg-cyan-500/20 text-cyan-400" : "bg-cyan-100 text-cyan-600"
                      }`}
                    >
                      Go
                    </div>
                  </div>
                  <p
                    className={`line-clamp-2 text-xs font-medium leading-relaxed ${
                      isDarkMode ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    {room.description || "Standard secure data frequency."}
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-current border-opacity-5 pt-4">
                  <span className={`text-[10px] font-bold tracking-widest ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}>
                    {room.members.length} IDENTITIES
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-6 backdrop-blur-md">
          <div
            className={`w-full max-w-md rounded-[40px] border p-10 shadow-2xl ${
              isDarkMode ? "border-white/10 bg-[#1a2131]" : "border-slate-200 bg-white"
            }`}
          >
            <h3 className="mb-8 text-2xl font-black uppercase tracking-tighter">Establish Node</h3>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="ml-1 text-[10px] font-black uppercase tracking-widest opacity-50">Node Identifier</label>
                <input
                  value={form.name}
                  onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                  placeholder="Enter name..."
                  className={`w-full rounded-2xl border px-5 py-4 outline-none transition-all ${
                    isDarkMode ? "border-white/10 bg-white/5 focus:border-cyan-500/50" : "border-slate-200 bg-slate-50 focus:border-cyan-500/50"
                  }`}
                />
              </div>

              <div className="space-y-2">
                <label className="ml-1 text-[10px] font-black uppercase tracking-widest opacity-50">Description</label>
                <textarea
                  value={form.description}
                  onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
                  placeholder="Optional room description..."
                  rows={3}
                  className={`w-full resize-none rounded-2xl border px-5 py-4 outline-none transition-all ${
                    isDarkMode ? "border-white/10 bg-white/5 focus:border-cyan-500/50" : "border-slate-200 bg-slate-50 focus:border-cyan-500/50"
                  }`}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={handleCreateRoom}
                  className="flex-1 rounded-2xl bg-cyan-500 py-4 text-[11px] font-black uppercase tracking-widest text-slate-900"
                >
                  Execute
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className={`flex-1 rounded-2xl py-4 text-[11px] font-black uppercase tracking-widest ${
                    isDarkMode ? "bg-white/5 text-slate-400" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  Abort
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
