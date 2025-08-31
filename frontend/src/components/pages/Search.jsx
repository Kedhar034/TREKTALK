
import { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { searchUsers, followUser, unfollowUser, getMe } from '../services/authService';
import { getNotifications, markNotificationRead, handleJoinRequest } from '../services/apiService';
import { useNavigate } from 'react-router-dom';

const socket = io(process.env.REACT_APP_SOCKET_URL);

const Search = () => {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState('');
  const [userId, setUserId] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userData = await getMe();
        setUserId(userData.user.id);
        const data = await getNotifications();
        setNotifications(data.notifications || []);
        socket.emit('joinUser', userData.user.id);
      } catch (err) {
        setError('Error fetching data');
        console.error(err);
      }
    };
    fetchData();

    socket.on('newNotification', (notification) => {
      setNotifications((prev) => [notification, ...prev]);
    });

    return () => socket.off('newNotification');
  }, []);

  const handleSearch = async () => {
    try {
      const data = await searchUsers(query);
      setUsers(data.users.map(u => ({ ...u, isFollowing: false })));
    } catch (err) {
      setError('Error searching users');
      console.error(err);
    }
  };

  const handleMarkRead = async (notificationId) => {
    try {
      await markNotificationRead(notificationId);
      setNotifications(notifications.map(n => 
        n._id === notificationId ? { ...n, read: true } : n
      ));
    } catch (err) {
      setError('Error marking as read');
      console.error(err);
    }
  };

  const handleFollow = async (userId) => {
    if (!userId) {
      setError('Invalid user ID');
      return;
    }
    try {
      await followUser(userId);
      setUsers(users.map(u => 
        u.id === userId ? { ...u, isFollowing: true } : u
      ));
      navigate('/profile', { state: { refresh: Date.now() } });
    } catch (err) {
      setError(err.response?.data?.message || 'Error following');
      console.error(err);
    }
  };

  const handleUnfollow = async (userId) => {
    if (!userId) {
      setError('Invalid user ID');
      return;
    }
    try {
      await unfollowUser(userId);
      setUsers(users.map(u => 
        u.id === userId ? { ...u, isFollowing: false } : u
      ));
      navigate('/profile', { state: { refresh: Date.now() } });
    } catch (err) {
      setError(err.response?.data?.message || 'Error unfollowing');
      console.error(err);
    }
  };

  const handleJoinRequestAction = async (requestId, status) => {
    try {
      const response = await handleJoinRequest(requestId, status);
      // Refresh notifications after approval/denial
      const data = await getNotifications();
      setNotifications(data.notifications || []);
      if (status === 'approved' && response.chatId) {
        alert('Join request approved! You are now friends and can chat.');
        navigate('/chat', { state: { chatId: response.chatId } });
      } else if (status === 'denied') {
        alert('Join request denied.');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Error handling join request';
      setError(msg);
      alert(msg);
      console.error('Join request error:', err, { requestId, status });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 bg-gradient-to-br from-green-50 to-white min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-green-700 tracking-tight flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 1.343-3 3 0 1.657 1.343 3 3 3s3-1.343 3-3c0-1.657-1.343-3-3-3zm0 0V4m0 7v7m0 0H7m5 0h5" /></svg>
        Search & Notifications
      </h1>
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/2">
          <div className="bg-white rounded-xl shadow p-4 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search users..."
                className="border border-green-200 rounded-lg p-2 w-full focus:ring-2 focus:ring-green-400 focus:outline-none"
              />
              <button onClick={handleSearch} className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold shadow hover:bg-green-700 transition">
                Search
              </button>
            </div>
            {users.length > 0 && (
              <ul className="space-y-4">
                {users.map((u) => (
                  <li key={u.id} className="flex items-center justify-between bg-green-50 rounded-lg p-3 shadow-sm">
                    <div className="flex items-center gap-3">
                      <img src={u.profilePic || 'https://via.placeholder.com/40'} alt="avatar" className="w-10 h-10 rounded-full border object-cover" />
                      <div>
                        <span className="font-semibold text-gray-800">{u.username}</span>
                        <div className="text-xs text-gray-500">{u.name}</div>
                      </div>
                    </div>
                    <button 
                      onClick={() => u.isFollowing ? handleUnfollow(u.id) : handleFollow(u.id)} 
                      className={`px-3 py-1 rounded-lg font-medium ${u.isFollowing ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-green-100 text-green-700 hover:bg-green-200'} transition`}
                    >
                      {u.isFollowing ? 'Unfollow' : 'Follow'}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <div className="md:w-1/2">
          <div className="bg-white rounded-xl shadow p-4">
            <h2 className="text-xl font-bold mb-4 text-green-700 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
              Notifications
            </h2>
            {notifications.length === 0 ? (
              <p className="text-gray-400 text-center">No notifications yet</p>
            ) : (
              <ul className="space-y-4">
                {notifications.map((n) => (
                  <li key={n._id} className={`rounded-lg p-4 shadow-sm border ${n.read ? 'bg-gray-50' : 'bg-green-50 border-green-200'}`}>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-semibold text-gray-800">{n.message}</span>
                      <span className="ml-auto text-xs text-gray-400">{new Date(n.createdAt).toLocaleString()}</span>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {!n.read && (
                        <button 
                          onClick={() => handleMarkRead(n._id)} 
                          className="text-green-700 text-xs font-semibold hover:underline"
                        >
                          Mark as Read
                        </button>
                      )}
                      {n.type === 'join_request' && n.joinRequestId && (
                        <>
                          <button 
                            onClick={() => handleJoinRequestAction(n.joinRequestId, 'approved')} 
                            className="bg-green-600 text-white px-3 py-1 rounded-lg font-semibold shadow hover:bg-green-700 transition"
                          >
                            Approve
                          </button>
                          <button 
                            onClick={() => handleJoinRequestAction(n.joinRequestId, 'denied')} 
                            className="bg-red-500 text-white px-3 py-1 rounded-lg font-semibold shadow hover:bg-red-600 transition"
                          >
                            Deny
                          </button>
                        </>
                      )}
                      {(n.type === 'join_approval' || n.type === 'join_denied') && (
                        <button 
                          onClick={() => n.chatId ? navigate('/chat', { state: { chatId: n.chatId } }) : null} 
                          className={`text-green-700 text-xs font-semibold hover:underline ${!n.chatId ? 'opacity-50 cursor-not-allowed' : ''}`}
                          disabled={!n.chatId}
                        >
                          {n.type === 'join_approval' ? 'Go to Chat' : 'Request Denied'}
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
            {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Search;