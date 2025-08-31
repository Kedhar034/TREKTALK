// src/pages/Profile.js (Updated with Instagram-like UI, tabs for Posts/Tweets, profile pic, email, logout button)
import { useEffect, useState } from 'react';
import { getMe, updateUsername } from '../../services/authService';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [activeTab, setActiveTab] = useState('posts'); // Default to 'posts'
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      localStorage.setItem('token', token);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    const fetchUser = async () => {
      try {
        const data = await getMe();
        setUser(data.user);
      } catch (err) {
        setError('Error fetching profile');
        navigate('/login');
      }
    };
    fetchUser();
  }, [navigate]);

  const handleUsernameSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await updateUsername(newUsername);
      setUser(data.user);
      setUsernameError('');
    } catch (err) {
      setUsernameError(err.response?.data?.message || 'Error updating username');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (!user) return <div className="text-center mt-10">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Username prompt for OAuth users */}
      {user.isOAuthTempUsername && (
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Choose a Username</h2>
          <form onSubmit={handleUsernameSubmit} className="flex flex-col gap-4">
            <input
              type="text"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              placeholder="Enter your username"
              className="border rounded p-2"
              required
            />
            <button type="submit" className="bg-blue-500 text-white rounded p-2 hover:bg-blue-600">
              Set Username
            </button>
            {usernameError && <p className="text-red-500">{usernameError}</p>}
          </form>
        </div>
      )}

      {/* Instagram-like Profile Header */}
      {!user.isOAuthTempUsername && (
        <div className="bg-white shadow rounded-lg p-6 mb-6 relative">
          {/* Logout Button - Top Right */}
          <button
            onClick={handleLogout}
            className="absolute top-4 right-4 text-gray-500 hover:text-red-500"
          >
            Logout
          </button>
          <div className="flex items-center space-x-6">
            {/* Profile Picture */}
            <img
              src={user.profile.profilePic || 'https://via.placeholder.com/150'}
              alt="Profile Pic"
              className="w-24 h-24 rounded-full object-cover"
            />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold">{user.username}</h2>
                <button
                  onClick={() => navigate('/')}
                  className="text-blue-500 hover:underline"
                >
                  Home
                </button>
              </div>
              <div className="flex space-x-8 mt-4">
                <p><strong>{user.postsCount || 0}</strong> posts</p> {/* Placeholder for future */}
                <p><strong>{user.followers && user.followers.length ? user.followers.length : 0}</strong> followers</p>
                <p><strong>{user.following && user.following.length ? user.following.length : 0}</strong> following</p>
              </div>
              <p className="mt-2 font-medium">{user.profile.name}</p>
              <p className="text-gray-600">{user.email}</p> {/* Added email */}
              <p className="text-gray-600">{user.profile.phone}</p>
              <p className="text-gray-600">{user.profile.bio || 'No bio yet'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Posts/Tweets Section with Tabs */}
      {!user.isOAuthTempUsername && (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex border-b mb-4">
            <button
              className={`flex-1 py-2 ${activeTab === 'posts' ? 'border-b-2 border-black font-semibold' : 'text-gray-500'}`}
              onClick={() => setActiveTab('posts')}
            >
              Posts
            </button>
            <button
              className={`flex-1 py-2 ${activeTab === 'tweets' ? 'border-b-2 border-black font-semibold' : 'text-gray-500'}`}
              onClick={() => setActiveTab('tweets')}
            >
              Tweets
            </button>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {activeTab === 'posts' ? (
              <div className="bg-gray-100 h-40 flex items-center justify-center text-gray-500 col-span-3">
                No posts yet (Future: Profile posts with images/captions)
              </div>
            ) : (
              <div className="bg-gray-100 h-40 flex items-center justify-center text-gray-500 col-span-3">
                No tweets yet (Future: Public tweets with collaboration options)
              </div>
            )}
          </div>
        </div>
      )}

      {error && <p className="text-red-500 text-center mt-4">{error}</p>}
    </div>
  );
};

export default Profile;