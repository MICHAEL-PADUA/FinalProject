import { useState, useEffect, createContext, useContext } from 'react'
import axios from 'axios'

const AuthContext = createContext()

axios.defaults.withCredentials = true
axios.defaults.baseURL = 'http://localhost:8000/api'

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

// Check if session or token is available in cookies/localStorage
  const checkSessionCookie = () => {
    const match = document.cookie.match(/access_token=[^;]+/)
    return !!match || localStorage.getItem('authToken') !== null
  }
// Fetch  user’s data if a valid session/token exists
  const fetchUserIfAuthenticated = async () => {
    if (checkSessionCookie()) {
      try {
        const res = await axios.get('/protected/', { withCredentials: true })
        setUser({
          username: res.data.user,
          usertype: res.data.usertype
        })
        setError(null)
      } catch {
        setUser(null)
      }
    } else {
      setUser(null)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchUserIfAuthenticated()
  }, [])

  // Log in the user and store token
  const logIn = async (credentials) => {
    setLoading(true)
    setError(null)
    try {
      const loginRes = await axios.post('/login/', credentials)
      localStorage.setItem('authToken', loginRes.data.token)

      // Fetch User Info
      const userRes = await axios.get('/protected/', { withCredentials: true })
      setUser({
        username: userRes.data.user,
        usertype: userRes.data.usertype
      })

      setLoading(false)
      return true
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid username or password')
      setUser(null)
      setLoading(false)
      return false
    }
  }
//Calls logout endpoint and removes token from local storage
  const logOut = async () => {
    setLoading(true)
    try {
      await axios.post('/logout/', {}, { withCredentials: true })
      localStorage.removeItem('authToken')
      setUser(null)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        error,
        loading,
        logIn,
        logOut,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
