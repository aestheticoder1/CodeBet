import React from 'react'
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
// import { useState } from 'react';

const App = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);
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
        </Routes>
        <Footer />
      </Router>
    </div>
  );
};

export default App;