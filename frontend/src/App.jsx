import React, { useState } from 'react'
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import api from "./api/axios.js";
import { setUser } from './redux/userSlice';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Footer from './components/Footer.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Dashboard from './pages/Dashboard.jsx';
import { ToastContainer } from 'react-toastify';
import { io } from 'socket.io-client';
import ContestPage from './pages/ContestPage.jsx';
import PastHistory from './pages/PastHistory.jsx';
// import { useState } from 'react';

const App = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io("http://localhost:5000");
    setSocket(newSocket);
    return () => newSocket.disconnect();
  }, []);
  // const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && !user) {
      api.get("/auth/profile", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          dispatch(setUser(res.data));
        })
        .catch(() => {
          localStorage.removeItem("token");
        })
    }
    // .finally(() => setLoading(false));
    // } else {
    //   setLoading(false);
    // }
  }, [dispatch, user]);

  // if (loading) return <div className="text-white text-center py-10">Loading...</div>;

  return (
    <div className="font-sans bg-background text-white min-h-screen">
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected Route */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard socket={socket} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/challenge/:id"
            element={
              <ProtectedRoute>
                <ContestPage socket={socket} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/past-history"
            element={
              <ProtectedRoute>
                <PastHistory/>
              </ProtectedRoute>
            }
          />
        </Routes>
        <Footer />
      </Router>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default App;