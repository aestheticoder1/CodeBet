import React from 'react'
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';

const App = () => {
  // const user = {
  //   name: "Nihal Rawat",
  //   email: "nihal@codebet.dev",
  //   profilePic: "https://ui-avatars.com/api/?name=Nihal+Rawat&color=111827",
  // };
  const user = null;
  return (
    <div className="font-sans bg-background text-white min-h-screen">
      <Navbar user={user} />
      <LandingPage/>
    </div>
  );
}

export default App