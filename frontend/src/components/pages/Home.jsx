import { useEffect, useState } from 'react';
import { getFeed, addComment, getComments, sendJoinRequest } from '../services/apiService';
import PostCard from './PostCard';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState('');
  const [commentContent, setCommentContent] = useState({});

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        const data = await getFeed();
        setPosts(data.posts || []);
      } catch (err) {
        setError('Error fetching feed');
      }
    };
    fetchFeed();
  }, []);

  const handleCommentChange = (postId, value) => {
    setCommentContent({ ...commentContent, [postId]: value });
  };

  const handleAddComment = async (postId) => {
    try {
      await addComment(postId, commentContent[postId]);
      setCommentContent({ ...commentContent, [postId]: '' });
      const commentsData = await getComments(postId);
      setPosts(posts.map(p => (p._id === postId ? { ...p, comments: commentsData.comments } : p)));
    } catch {
      setError('Error adding comment');
    }
  };

  const handleSendJoinRequest = async (postId) => {
    const note = prompt('Enter note for join request:');
    if (note === null) return;
    try {
      await sendJoinRequest(postId, note);
      alert('Request sent!');
    } catch {
      setError('Error sending request');
    }
  };

  return (
    <div className="max-w-md mx-auto p-0 sm:p-4">
      <h1 className="text-3xl font-bold mb-8 text-green-700 tracking-tight flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 1.343-3 3 0 1.657 1.343 3 3 3s3-1.343 3-3c0-1.657-1.343-3-3-3zm0 0V4m0 7v7m0 0H7m5 0h5" /></svg>
        Trip Feed
      </h1>
      {posts.length === 0 ? (
        <div className="bg-gray-100 h-40 flex items-center justify-center text-gray-500 rounded-lg">
          No posts or tweets yet
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              commentValue={commentContent[post._id] || ''}
              onCommentChange={handleCommentChange}
              onAddComment={handleAddComment}
              onSendJoinRequest={handleSendJoinRequest}
            />
          ))}
        </div>
      )}
      {error && <p className="text-red-500 text-center mt-4">{error}</p>}
    </div>
  );
};

export default Home;