import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuthStore()
  if (!currentUser) return <Navigate to="/login" />
  return children
}

export default ProtectedRoute