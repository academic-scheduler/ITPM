/* eslint-disable prettier/prettier */
import { useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { logoutUser } from '../../../services/auth'
import { AuthContext } from '../../../context/AuthContext'

const Logout = () => {
  const navigate = useNavigate()
  const { logout } = useContext(AuthContext)

  useEffect(() => {
    const handleLogout = async () => {
      await logoutUser()
      logout()   // Clear context as well
      navigate('/login')
    }
    handleLogout()
  }, [logout, navigate])

  return <div>Logging out...</div>
}

export default Logout
