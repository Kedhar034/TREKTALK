// src/App.js (Updated to include BottomNav on all pages)
import { Routes, Route } from 'react-router-dom';
import Signup from './components/pages/Signup';
import Login from './components/pages/Login';
import Profile from './components/pages/Profile';
import Home from './components/pages/Home';
import Search from './components/pages/Search'; // New
import Chat from './components/pages/Chat'; // New
import NewPost from './components/pages/NewPost'; // New
import BottomNav from './components/layout/BottomNav';

function App() {
  return (
    <div className="App" style={{ minHeight: '100vh', position: 'relative', paddingBottom: '64px' }}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/search" element={<Search />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/new-post" element={<NewPost />} />
      </Routes>
      <div style={{ position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 50 }}>
        <BottomNav />
      </div>
    </div>
  );
}

export default App;