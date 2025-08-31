
import SignupForm from '../Auth/SignupForm';
import { googleAuth } from '../services/authService';
import { Link } from 'react-router-dom';

const Signup = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 40 }}>
      <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #ccc', padding: 32, minWidth: 350 }}>
        <h2 style={{ textAlign: 'center', marginBottom: 24 }}>Create Your Account</h2>
        <SignupForm />
        <button style={{ marginTop: 16, background: '#4285F4', color: '#fff', border: 'none', borderRadius: 4, padding: '10px 0', width: '100%', fontWeight: 'bold', cursor: 'pointer' }} onClick={googleAuth}>
          Signup with Google
        </button>
        <div style={{ marginTop: 16, textAlign: 'center' }}>
          Already have an account? <Link to="/login">Login</Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;