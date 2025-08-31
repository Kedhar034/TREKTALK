// src/components/Layout/BottomNav.js (New component for bottom navigation)
import { useNavigate } from 'react-router-dom';

const BottomNav = () => {
  const navigate = useNavigate();

  return (
    <div className=" max-w-4xl items-center mx-auto fixed bottom-0 left-0 right-0 bg-white shadow-lg flex justify-around py-2">
      <button onClick={() => navigate('/')} className="text-gray-600 hover:text-blue-500">
        Home
      </button>
      <button onClick={() => navigate('/search')} className="text-gray-600 hover:text-blue-500">
        Search
      </button>
      <button onClick={() => navigate('/new-post')} className="text-2xl text-blue-500" title="Create Post">
        <span style={{fontSize: '1em', fontWeight: 'bold'}}>+</span>
      </button>
      <button onClick={() => navigate('/chat')} className="text-gray-600 hover:text-blue-500">
        Chat
      </button>
      <button onClick={() => navigate('/profile')} className="text-gray-600 hover:text-blue-500">
        Profile
      </button>
      
    </div>
  );
};

export default BottomNav;