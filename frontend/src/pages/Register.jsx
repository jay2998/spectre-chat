import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { axiosInstance } from '../lib/axiosInstance'
import toast from 'react-hot-toast'

const Register = () => {
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await axiosInstance.post('/auth/register', form)
      toast.success('Account created! Please login.')
      navigate('/login')
    } catch (err) {
      toast.error(err.response?.data || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="bg-gray-900 w-full max-w-md rounded-2xl p-8 border border-gray-800">
        <h1 className="text-2xl font-bold text-white mb-1">Create account</h1>
        <p className="text-sm text-gray-400 mb-6">Join the chat</p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input name="username" placeholder="Username" onChange={handleChange}
            className="bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500 transition placeholder-gray-500" required />
          <input name="email" type="email" placeholder="Email" onChange={handleChange}
            className="bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500 transition placeholder-gray-500" required />
          <input name="password" type="password" placeholder="Password" onChange={handleChange}
            className="bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500 transition placeholder-gray-500" required />
          <button type="submit" disabled={loading}
            className="bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition disabled:opacity-60">
            {loading ? 'Creating...' : 'Create Account'}
          </button>
        </form>
        <p className="text-sm text-center text-gray-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-400 hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}

export default Register