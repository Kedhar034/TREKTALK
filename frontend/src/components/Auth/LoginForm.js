import { useState } from 'react';
import { login } from '../services/authService';
import { useNavigate } from 'react-router-dom';

const LoginForm = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    console.log('[LoginForm] Submitting login with:', formData);
    try {
      const res = await login(formData);
      console.log('[LoginForm] Login response:', res);
      // Check if token is set in localStorage
      const token = localStorage.getItem('token');
      console.log('[LoginForm] Token in localStorage after login:', token);
      if (token && token !== 'null' && token !== 'undefined') {
        navigate('/profile');
      } else {
        setError('Login failed: No token received.');
        console.error('[LoginForm] No token received after login');
      }
    } catch (err) {
      console.error('[LoginForm] Login error:', err);
      setError(
        err.response?.data?.message ||
        err.message ||
        'Error logging in'
      );
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="username" placeholder="Username" onChange={handleChange} required />
      <input name="password" type="password" placeholder="Password" onChange={handleChange} required />
      <button type="submit">Login</button>
      {error && <p>{error}</p>}
    </form>
  );
};

export default LoginForm;