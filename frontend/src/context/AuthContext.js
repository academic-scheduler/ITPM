/* eslint-disable prettier/prettier */
import React, { createContext, useState, useEffect } from 'react'

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [username, setUsername] = useState(localStorage.getItem('username') || null)

  useEffect(() => {
    const storedUser = localStorage.getItem('username')
    if (storedUser) {
      setUsername(storedUser)
    }
  }, [])

  const login = (user) => {
    localStorage.setItem('username', user)
    setUsername(user)
  }

  const logout = () => {
    localStorage.removeItem('username')
    setUsername(null)
  }

  return (
    <AuthContext.Provider value={{ username, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
