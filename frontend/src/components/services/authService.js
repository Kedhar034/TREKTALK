
import axios from 'axios';
import { getValidToken } from './tokenUtils';
const API_URL = process.env.REACT_APP_AUTH_URL;
console.log('[authService] API_URL:', API_URL);

const signup = async (data) => {
  const response = await axios.post(`${API_URL}/signup`, data);
  localStorage.setItem('token', response.data.token);
  return response.data;
};

const login = async (data) => {
  const response = await axios.post(`${API_URL}/login`, data);
  localStorage.setItem('token', response.data.token);
  return response.data;
};

const getMe = async () => {
  const token = getValidToken();
  if (!token) throw new Error('No valid token');
  const response = await axios.get(`${API_URL}/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

const updateUsername = async (username) => {
  const token = getValidToken();
  if (!token) throw new Error('No valid token');
  const response = await axios.post(
    `${API_URL}/update-username`,
    { username },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

const googleAuth = () => {
  window.location.href = `${API_URL}/google`;
};

const searchUsers = async (query) => {
  const token = getValidToken();
  if (!token) throw new Error('No valid token');
  const response = await axios.get(`${API_URL}/search-users?query=${query}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

const followUser = async (userId) => {
  const token = getValidToken();
  if (!token) throw new Error('No valid token');
  const response = await axios.post(`${API_URL}/follow/${userId}`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

const unfollowUser = async (userId) => {
  const token = getValidToken();
  if (!token) throw new Error('No valid token');
  const response = await axios.post(`${API_URL}/unfollow/${userId}`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export { signup, login, getMe, updateUsername, googleAuth, searchUsers, followUser, unfollowUser };