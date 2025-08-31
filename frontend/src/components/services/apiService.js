import axios from 'axios';
import { getValidToken } from './tokenUtils';
const API_URL = process.env.REACT_APP_MAIN_URL;
console.log('[apiService] API_URL:', API_URL);

// Fetch all messages for a chat
const getMessages = async (chatId) => {
  const token = getValidToken();
  if (!token) throw new Error('No valid token');
  const response = await axios.get(`${API_URL}/chats/${chatId}/messages`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

const createPost = async (formData) => {
  const token = getValidToken();
  if (!token) throw new Error('No valid token');
  const response = await axios.post(`${API_URL}/posts`, formData, {
    headers: { 
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

const getUserPosts = async (userId) => {
  const token = getValidToken();
  if (!token) throw new Error('No valid token');
  const response = await axios.get(`${API_URL}/posts/user/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

const getFeed = async () => {
  const token = getValidToken();
  if (!token) throw new Error('No valid token');
  const response = await axios.get(`${API_URL}/feed`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

const addComment = async (postId, content) => {
  const token = getValidToken();
  if (!token) throw new Error('No valid token');
  const response = await axios.post(`${API_URL}/comments`, { postId, content }, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

const getComments = async (postId) => {
  const token = getValidToken();
  if (!token) throw new Error('No valid token');
  const response = await axios.get(`${API_URL}/comments/${postId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

const sendJoinRequest = async (postId, note) => {
  const token = getValidToken();
  if (!token) throw new Error('No valid token');
  const response = await axios.post(`${API_URL}/join-request`, { postId, note }, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

const handleJoinRequest = async (requestId, status) => {
  const token = getValidToken();
  if (!token) throw new Error('No valid token');
  const response = await axios.post(`${API_URL}/handle-join-request`, { requestId, status }, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

const getNotifications = async () => {
  const token = getValidToken();
  if (!token) throw new Error('No valid token');
  const response = await axios.get(`${API_URL}/notifications`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

const markNotificationRead = async (notificationId) => {
  const token = getValidToken();
  if (!token) throw new Error('No valid token');
  const response = await axios.post(`${API_URL}/notifications/read/${notificationId}`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

const getChats = async () => {
  const token = getValidToken();
  if (!token) throw new Error('No valid token');
  const response = await axios.get(`${API_URL}/chats`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

const createChat = async (participantId) => {
  const token = getValidToken();
  if (!token) throw new Error('No valid token');
  const response = await axios.post(`${API_URL}/chats`, { participantId }, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export { createPost, getUserPosts, getFeed, addComment, getComments, sendJoinRequest, handleJoinRequest, getNotifications, markNotificationRead, getChats, createChat, getMessages };