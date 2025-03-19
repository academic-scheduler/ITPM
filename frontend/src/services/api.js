/* eslint-disable prettier/prettier */
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,  // Make sure you have this in your .env file!
  withCredentials: true, // if using sessions or cookies; otherwise can remove
})

export default api
