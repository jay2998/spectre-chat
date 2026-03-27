import { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import ChatRoom from "./pages/ChatRoom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Register from "./pages/Register";
import { useAuthStore } from "./store/authStore";

const App = () => {
  const { currentUser, checkAuth, isCheckingAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isCheckingAuth && !currentUser) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 text-white">
        <p>Loading session...</p>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={currentUser ? <Home /> : <Navigate to="/login" />} />
      <Route path="/login" element={!currentUser ? <Login /> : <Navigate to="/" />} />
      <Route path="/register" element={!currentUser ? <Register /> : <Navigate to="/" />} />
      <Route path="/profile" element={currentUser ? <Profile /> : <Navigate to="/login" />} />
      <Route path="/chat/:id" element={currentUser ? <ChatRoom /> : <Navigate to="/login" />} />
    </Routes>
  );
};

export default App;
