// src/components/services/tokenUtils.js
export function getValidToken() {
  const token = localStorage.getItem('token');
  if (!token || token === 'null' || token === 'undefined') return null;
  return token;
}
