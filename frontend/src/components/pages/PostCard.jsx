import { useState } from 'react';

const PostCard = ({ post, commentValue, onCommentChange, onAddComment, onSendJoinRequest }) => {
  const [imgIdx, setImgIdx] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const hasImages = post.images && post.images.length > 0;
  const totalImages = hasImages ? post.images.length : 0;

  const handlePrev = (e) => {
    e.stopPropagation();
    setImgIdx((idx) => (idx === 0 ? totalImages - 1 : idx - 1));
  };
  const handleNext = (e) => {
    e.stopPropagation();
    setImgIdx((idx) => (idx === totalImages - 1 ? 0 : idx + 1));
  };

  return (
    <div className="bg-white shadow-lg rounded-xl overflow-hidden p-4">
      <div className="flex items-center gap-3 pb-2">
        <img
          src={post.profilePic || 'https://via.placeholder.com/40'}
          alt="Poster avatar"
          className="w-10 h-10 rounded-full border object-cover"
        />
        <span className="font-semibold text-gray-800">{post.username}</span>
      </div>
      <div className="py-2">
        <p className="text-gray-900 mb-2">{post.content}</p>
      </div>
      {hasImages && (
        <div className="relative w-full bg-gray-100 flex items-center justify-center" style={{ minHeight: '320px' }}>
          <img
            src={`http://localhost:3002${post.images[imgIdx]}`}
            alt={`Post ${imgIdx + 1}`}
            className="w-full object-cover max-h-96 rounded"
            style={{ aspectRatio: '1/1', background: '#f3f4f6' }}
          />
          {totalImages > 1 && (
            <>
              <button
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 shadow hover:bg-white"
                onClick={handlePrev}
                aria-label="Previous image"
              >
                &#8592;
              </button>
              <button
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 shadow hover:bg-white"
                onClick={handleNext}
                aria-label="Next image"
              >
                &#8594;
              </button>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                {post.images.map((_, i) => (
                  <span key={i} className={`inline-block w-2 h-2 rounded-full ${i === imgIdx ? 'bg-blue-500' : 'bg-gray-300'}`} />
                ))}
              </div>
            </>
          )}
        </div>
      )}
      {post.type === 'tweet' && post.tripDetails && (
        <div className="mb-2">
          <p className="text-sm text-gray-600">Trip: {post.tripDetails.location} on {post.tripDetails.dates.join(', ')}</p>
          <button
            onClick={() => onSendJoinRequest(post._id)}
            className="text-blue-500 hover:underline text-sm"
          >
            Request to Join
          </button>
        </div>
      )}
      <div className="mt-4">
        <button 
          onClick={() => setShowComments(!showComments)} 
          className="text-gray-500 hover:underline text-sm mb-2"
        >
          {showComments ? 'Hide Comments' : `View all ${post.comments?.length || 0} comments`}
        </button>
        {showComments && (
          <div className="max-h-32 overflow-y-scroll mb-2">
            {post.comments?.map((c) => {
              const profilePic = c?.userId?.profile?.profilePic || 'https://via.placeholder.com/30';
              const username = c?.userId?.username || 'Unknown';
              return (
                <div key={c._id} className="flex items-start gap-2 mb-1">
                  <img
                    src={profilePic}
                    alt="Commenter avatar"
                    className="w-6 h-6 rounded-full border object-cover"
                  />
                  <p className="text-sm">
                    <span className="font-semibold">{username}:</span> {c.content}
                  </p>
                </div>
              );
            })}
          </div>
        )}
        <div className="flex items-center gap-2">
          <input
            value={commentValue}
            onChange={(e) => onCommentChange(post._id, e.target.value)}
            placeholder="Add a comment..."
            className="border rounded p-2 w-full text-sm"
          />
          <button
            onClick={() => onAddComment(post._id)}
            className="text-blue-500 text-sm hover:underline"
          >
            Post
          </button>
        </div>
      </div>
      <p className="text-xs text-gray-400 mt-2">{new Date(post.createdAt).toLocaleString()}</p>
    </div>
  );
};

export default PostCard;