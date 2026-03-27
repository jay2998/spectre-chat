import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { axiosInstance } from "../lib/axiosInstance";
import { useAuthStore } from "../store/authStore";
import toast from "react-hot-toast";

const Profile = () => {
  const { currentUser, setCurrentUser } = useAuthStore();
  const navigate = useNavigate();
  const [bio, setBio] = useState(currentUser?.bio || "");
  const [uploading, setUploading] = useState(false);
  const [avatar, setAvatar] = useState(currentUser?.avatar || "");

  const handleAvatar = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      try {
        const res = await axiosInstance.post("/messages/upload", {
          file: reader.result,
        });
        setAvatar(res.data.url);
        toast.success("Avatar uploaded!");
      } catch (err) {
        console.error("Upload error:", err);
        toast.error("Upload failed");
      } finally {
        setUploading(false);
      }
    };
    reader.onerror = () => {
      toast.error("Could not read file");
      setUploading(false);
    };
  };

  const handleSave = async () => {
    try {
      const res = await axiosInstance.put("/auth/profile", { bio, avatar });
      setCurrentUser(res.data);
      toast.success("Profile Updated!");
    } catch (err) {
      toast.error("Save failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center px-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 w-full max-w-md">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate("/")}
            className="text-gray-400 hover:text-white transition"
          >
            ←
          </button>
          <h1 className="text-xl font-bold">Edit Profile</h1>
        </div>

        {/* Avatar */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-20 h-20 rounded-full bg-indigo-600 flex items-center justify-center text-2xl font-bold mb-3 overflow-hidden">
            {avatar ? (
              <img src={avatar} className="w-full h-full object-cover" alt="" />
            ) : (
              currentUser?.username?.charAt(0).toUpperCase()
            )}
          </div>
          <label className="cursor-pointer text-sm text-indigo-400 hover:underline">
            {uploading ? "Uploading..." : "Change avatar"}
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatar}
              className="hidden"
            />
          </label>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <label className="text-sm text-gray-400 block mb-1">Username</label>
            <input
              value={currentUser?.username}
              disabled
              className="w-full bg-gray-800 border border-gray-700 text-gray-500 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-sm text-gray-400 block mb-1">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell people about yourself..."
              rows={3}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500 transition resize-none placeholder-gray-500"
            />
          </div>
          <button
            onClick={handleSave}
            className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
