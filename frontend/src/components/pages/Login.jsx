
import LoginForm from '../Auth/LoginForm';
import { googleAuth } from '../services/authService';
import { Link } from 'react-router-dom';

const Login = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 40 }}>
      <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #ccc', padding: 32, minWidth: 350 }}>
        <h2 style={{ textAlign: 'center', marginBottom: 24 }}>Login to Your Account</h2>
        <LoginForm />
        <button style={{ marginTop: 16, background: '#4285F4', color: '#fff', border: 'none', borderRadius: 4, padding: '10px 0', width: '100%', fontWeight: 'bold', cursor: 'pointer' }} onClick={googleAuth}>
          Login with Google
        </button>
        <div style={{ marginTop: 16, textAlign: 'center' }}>
          Don't have an account? <Link to="/signup">Signup</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;