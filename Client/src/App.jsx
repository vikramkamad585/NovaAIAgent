import React from "react"
import { Navigate, Route, Routes } from "react-router-dom"
import Home from './pages/Home'
import Login from './pages/Login'
import { useEffect, useState } from "react"
import axios from 'axios'
import ProtectedRoute from "./Components/ProtectedRoute"
import Navbar from "./Components/Navbar"
import Builder from "./pages/Builder"
import Billing from "./pages/Billing"
import {Toaster} from 'react-hot-toast'

// Env-driven URLs: falls back to localhost in dev, uses VITE_* vars in production
// (see .env.production). VITE_ vars are inlined by Vite at build time.
export const ServerUrl = import.meta.env.VITE_SERVER_URL || "http://localhost:8000"
export const CLIENT_URL = import.meta.env.VITE_CLIENT_URL || "http://localhost:5173"

function App(){

  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(()=> {
    const fetchme = async () => {
      try{
        const res = await axios.get(ServerUrl + "/api/user/current-user", {withCredentials:true})
        setUser(res.data)
      }catch(error){
        // 400/401 here just means "not logged in yet" — expected, not an error.
        const status = error?.response?.status
        if (status !== 400 && status !== 401) {
          console.log("current-user error", error)
        }
        setUser(null)
      }finally{
        setLoading(false)
      }
    }
    fetchme()
  },[])

  return (
    <>
    <Toaster position="top-right"/>
    <Routes>
      
      <Route path='/login' element={<Login setUser={setUser}/>} />

      <Route path="/*" element={<ProtectedRoute user={user} loading={loading}>

        <Navbar setUser={setUser} user={user}/>
        <Routes>
          <Route path='/' element={<Home user={user}/>} />
          <Route path="/builder" element={<Builder user={user} setUser={setUser}/> }/>
          <Route path="/billing" element={<Billing user={user} setUser={setUser}/> }/>
          <Route path="*" element={<Navigate to="/" replace/>} />
        </Routes>

      </ProtectedRoute>}/>
    </Routes>
    </>
  )
}

export default App
