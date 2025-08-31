import { useRef, useCallback, useState, useEffect } from 'react';
import io from 'socket.io-client';
import { useLocation } from 'react-router-dom';
import { getMe } from '../services/authService';
import { getChats, createChat, getMessages } from '../services/apiService';

const socket = io(process.env.REACT_APP_SOCKET_URL);

const Chat = () => {
  const [chats, setChats] = useState([]);
  const [chatUsers, setChatUsers] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [userId, setUserId] = useState('');
  const location = useLocation();
  const messagesEndRef = useRef(null);

  // Refetch chats and users
  const fetchChatsAndUsers = useCallback(async () => {
    try {
      const userData = await getMe();
      setUserId(userData.user.id);
      const chatsData = await getChats();
      setChats(chatsData.chats || []);
      setChatUsers(chatsData.chatUsers || []);
      if (location.state?.chatId) {
        const chat = chatsData.chats?.find(c => c._id === location.state.chatId);
        if (chat) {
          setSelectedChat(chat);
          setMessages(chat.messages || []);
          socket.emit('joinChat', chat._id);
        }
      }
    } catch (err) {
      console.error('Error fetching chats:', err);
    }
  }, [location.state?.chatId]);

  useEffect(() => {
    fetchChatsAndUsers();

    const handleReceiveMessage = (data) => {
  if (data.chatId === selectedChat?._id) {
        setMessages((prev) => [
          ...prev,
          {
            ...data,
            senderId: typeof data.senderId === 'object' ? data.senderId.toString() : String(data.senderId),
            createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
          },
        ]);
      }
    };

    socket.on('receiveMessage', handleReceiveMessage);
    socket.on('newChat', fetchChatsAndUsers);

    return () => {
      socket.off('receiveMessage', handleReceiveMessage);
      socket.off('newChat', fetchChatsAndUsers);
    };
  }, [fetchChatsAndUsers, selectedChat?._id]);

  // Scroll to latest message
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const selectChat = async (chatOrUser) => {
    if (chatOrUser._id) {
      setSelectedChat(chatOrUser);
      socket.emit('joinChat', chatOrUser._id);
      try {
        const res = await getMessages(chatOrUser._id);
        setMessages(res.messages || []);
      } catch (err) {
        setMessages([]);
      }
    } else {
      try {
        const newChat = await createChat(chatOrUser.id);
        await fetchChatsAndUsers();
        setSelectedChat(newChat.chat);
        socket.emit('joinChat', newChat.chat._id);
        const res = await getMessages(newChat.chat._id);
        setMessages(res.messages || []);
      } catch (err) {
        setMessages([]);
      }
    }
  };

  const sendMessage = () => {
    if (message && selectedChat) {
      socket.emit('sendMessage', { chatId: selectedChat._id, message, userId });
      setMessage('');
      // No messages update here; wait for socket event.
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 flex h-[90vh] bg-gradient-to-br from-green-50 to-white rounded-xl shadow-lg">
      {/* Sidebar */}
      <div className="w-1/3 border-r pr-4 overflow-y-auto bg-white rounded-l-xl flex flex-col">
        <h1 className="text-3xl font-bold mb-6 text-green-700 tracking-tight flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2v-8a2 2 0 012-2h2" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 3h-6a2 2 0 00-2 2v2a2 2 0 002 2h6a2 2 0 002-2V5a2 2 0 00-2-2z" /></svg>
          Chats
        </h1>
        <ul className="space-y-2 flex-1">
          {chats.map((chat) => {
            const other = chat.participants.find((p) => p && p._id !== userId);
            return (
              <li
                key={chat._id}
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer font-medium transition ${selectedChat?._id === chat._id ? 'bg-green-100 text-green-800' : 'hover:bg-gray-100 text-gray-700'}`}
                onClick={() => selectChat(chat)}
              >
                <img src={other && other.profile && other.profile.profilePic ? other.profile.profilePic : 'https://via.placeholder.com/32'} alt="avatar" className="w-8 h-8 rounded-full border object-cover" />
                <span>{other && other.username ? other.username : 'Unknown'}</span>
              </li>
            );
          })}
        </ul>
        {/* <h2 className="text-lg font-semibold mt-4 mb-2 sticky top-0 bg-white p-2">Start New Chat</h2> */}
        {/* {chatUsers?.map((user) => (
          <div
            key={user.id}
            onClick={() => selectChat(user)}
            className="cursor-pointer p-2 hover:bg-gray-100 flex items-center gap-3"
          >
            <img
              src={user && user.profile && user.profile.profilePic ? user.profile.profilePic : 'https://via.placeholder.com/40'}
              alt="User avatar"
              className="w-10 h-10 rounded-full object-cover"
            />
            <p className="font-semibold">{user && user.username ? user.username : 'Unknown'}</p>
          </div>
        ))} */}
      </div>
      {/* Chat Window */}
      <div className="flex-1 bg-white rounded-r-xl shadow p-6 flex flex-col">
        {selectedChat ? (
          <>
            <div className="flex items-center gap-3 p-2 border-b sticky top-0 bg-white">
              {(!selectedChat.participants || !Array.isArray(selectedChat.participants)) ? (
                <>
                  <img
                    src="https://via.placeholder.com/40"
                    alt="User avatar"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <h2 className="text-xl font-semibold">Unknown</h2>
                </>
              ) : (() => {
                const other = selectedChat.participants.find((p) => p && p._id !== userId);
                return (
                  <>
                    <img
                      src={other && other.profile && other.profile.profilePic ? other.profile.profilePic : 'https://via.placeholder.com/40'}
                      alt="User avatar"
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <h2 className="text-xl font-semibold">{other && other.username ? other.username : 'Unknown'}</h2>
                  </>
                );
              })()}
            </div>
            <div className="flex-1 overflow-y-auto mb-4 pr-2" style={{ maxHeight: '65vh' }}>
              {messages.map((msg, idx) => {
                const sender = typeof msg.senderId === 'object' ? msg.senderId.toString() : String(msg.senderId);
                return (
                  <div key={idx} className={`mb-3 flex ${sender === userId ? 'justify-end' : 'justify-start'}`}>
                    <div className={`px-5 py-3 rounded-2xl shadow ${sender === userId ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-800'} max-w-[70%] break-words`}>
                      {msg.content}
                      <div className="text-xs text-gray-400 mt-1 text-right">{msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString() : ''}</div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
            <div className="flex gap-2 mt-auto sticky bottom-0 bg-white py-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="flex-1 border border-green-200 rounded-lg p-3 focus:ring-2 focus:ring-green-400 focus:outline-none"
                placeholder="Type a message..."
              />
              <button className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold shadow hover:bg-green-700 transition" onClick={sendMessage}>Send</button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center">
            <p className="text-gray-500">Select a chat or user to start messaging</p>
            <p className="text-xs text-red-500 mt-2">
              (If you clicked a chat and still see this, selectedChat is not being set. Check console logs for debug info.)
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
