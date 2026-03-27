import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { axiosInstance } from '../lib/axiosInstance'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'

const Login = () => {
  const [form, setForm] = useState({ username: '', password: '' })
  const [loading, setLoading] = useState(false)
  const { setCurrentUser } = useAuthStore()
  const navigate = useNavigate()

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await axiosInstance.post('/auth/login', form)
      setCurrentUser(res.data)
      toast.success(`Welcome back, ${res.data.username}!`)
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="bg-gray-900 w-full max-w-md rounded-2xl p-8 border border-gray-800">
        <h1 className="text-2xl font-bold text-white mb-1">Welcome back</h1>
        <p className="text-sm text-gray-400 mb-6">Sign in to continue</p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input name="username" placeholder="Username" onChange={handleChange}
            className="bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500 transition" required />
          <input name="password" type="password" placeholder="Password" onChange={handleChange}
            className="bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500 transition" required />
          <button type="submit" disabled={loading}
            className="bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition disabled:opacity-60">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <div className="mt-3 text-right">
          <Link to="/reset-password" className="text-sm text-indigo-400 hover:underline">
            Forgot password?
          </Link>
        </div>
        <p className="text-sm text-center text-gray-500 mt-6">
          New user? <Link to="/register" className="text-indigo-400 hover:underline">Register</Link>
        </p>
      </div>
    </div>
  )
}

export default Login
