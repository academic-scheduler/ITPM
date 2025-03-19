/* eslint-disable prettier/prettier */
import api from './api'

export const registerUser = (userData) => {
  return api.post('/api/register/', userData)
}

export const loginUser = async (loginData) => {
  try {
    const response = await api.post('/api/login/', loginData)
    if (response.data && response.data.username) {
      localStorage.setItem('username', response.data.username)  // Save username after login
    }
    return response.data
  } catch (error) {
    throw error.response?.data || { error: 'Login failed' }
  }
}

export const logoutUser = async () => {
  try {
    await api.post('/api/logout/')
    localStorage.removeItem('username')  // Clear username on logout
  } catch (error) {
    console.error('Logout error:', error)
  }
}
