import { useEffect, useState, useCallback } from 'react';
import { getMe, updateUsername } from '../services/authService';
import { useNavigate, useLocation } from 'react-router-dom';
import { getUserPosts, getComments } from '../services/apiService';
// import PostCard from './PostCard';
import PostOrTweetCard from './PostOrTweetCard';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [activeTab, setActiveTab] = useState('posts');
  const navigate = useNavigate();
  const location = useLocation();

  const fetchUser = useCallback(async () => {
    try {
      const data = await getMe();
      setUser(data.user);

      // Fetch user posts and comments for each post
      const postsData = await getUserPosts(data.user.id || data.user._id);
      const postsWithComments = await Promise.all(
        postsData.posts.map(async (post) => {
          const commentsData = await getComments(post._id);
          return { ...post, comments: commentsData.comments };
        })
      );
      setPosts(postsWithComments);
    } catch (err) {
      setError('Failed to fetch user data');
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const handleLogout = async () => {
    // Logout logic here
  };

  const handleUsernameSubmit = async (e) => {
    e.preventDefault();
    setUsernameError('');

    if (newUsername.trim().length < 3) {
      setUsernameError('Username must be at least 3 characters long');
      return;
    }

    try {
      await updateUsername(newUsername);
      setUser({ ...user, username: newUsername });
      setNewUsername('');
    } catch (err) {
      setUsernameError('Failed to update username');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 bg-gradient-to-br from-green-50 to-white min-h-screen">
      {error ? (
        <div className="text-red-500 text-center">{error}</div>
      ) : null}

      {user && user.isOAuthTempUsername && (
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

      {user && !user.isOAuthTempUsername && (
        <>
          <div className="bg-white shadow rounded-2xl p-8 mb-8 relative flex flex-col items-center max-w-2xl mx-auto">
            <button
              onClick={handleLogout}
              className="absolute top-4 right-4 text-gray-400 hover:text-red-500 text-lg"
              title="Logout"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1" /></svg>
            </button>
            <img
              src={user.profile.profilePic}
              alt="Profile Pic"
              className="w-28 h-28 rounded-full object-cover border-4 border-green-200 shadow mb-4"
            />
            <h2 className="text-3xl font-bold text-green-700 mb-1">{user.username}</h2>
            <div className="flex gap-8 justify-center mb-2 text-center">
              <div>
                <span className="block text-lg font-bold text-gray-900">{posts.length}</span>
                <span className="text-xs text-gray-500 uppercase tracking-wide">Posts</span>
              </div>
              <div>
                <span className="block text-lg font-bold text-gray-900">{Array.isArray(user.followers) ? user.followers.length : user.followers}</span>
                <span className="text-xs text-gray-500 uppercase tracking-wide">Followers</span>
              </div>
              <div>
                <span className="block text-lg font-bold text-gray-900">{Array.isArray(user.following) ? user.following.length : user.following}</span>
                <span className="text-xs text-gray-500 uppercase tracking-wide">Following</span>
              </div>
            </div>
            <div className="text-gray-700 text-base font-medium mb-1">{user.profile.name}</div>
            <div className="text-gray-500 text-sm mb-1">{user.email}</div>
            <div className="text-gray-500 text-sm mb-1">{user.profile.phone}</div>
            <div className="text-gray-600 text-sm italic text-center max-w-md">{user.profile.bio || 'No bio yet'}</div>
          </div>

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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {posts.length === 0 ? (
                <div className="bg-gray-100 h-40 flex items-center justify-center text-gray-500 col-span-2">
                  {activeTab === 'posts' ? 'No posts yet' : 'No tweets yet'}
                </div>
              ) : (
                posts
                  .filter((post) => post.type === activeTab.slice(0, -1))
                  .map((post) => (
                    <PostOrTweetCard key={post._id} post={post} />
                  ))
              )}
            </div>
          </div>
        </>
      )}

      {error && <p className="text-red-500 text-center mt-4">{error}</p>}
    </div>
  );
};

export default Profile;
