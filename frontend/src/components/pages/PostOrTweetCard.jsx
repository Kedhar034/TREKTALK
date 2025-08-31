
import { useState } from 'react';

const PostOrTweetCard = ({ post }) => {
  const [showComments, setShowComments] = useState(false);
  const [imgIdx, setImgIdx] = useState(0);
  const images = post.images || [];
  const hasImages = images.length > 0;
  const author = post.author || {};

  // Instagram-style card
  return (
    <div
      className={`bg-white rounded-2xl shadow-md mb-6 border border-gray-100 transition-transform duration-200 hover:scale-[1.02] hover:shadow-lg cursor-pointer w-full max-w-[420px] mx-auto flex flex-col justify-between ${hasImages ? 'min-h-[420px]' : 'min-h-[260px]'}`}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-2">
        <img
          src={author.profilePic || 'https://via.placeholder.com/40'}
          alt="avatar"
          className="w-10 h-10 rounded-full object-cover border"
        />
        <div className="flex-1">
          <span className="font-semibold text-gray-900">{author.username || 'User'}</span>
          <span className="block text-xs text-gray-400">{new Date(post.createdAt).toLocaleString()}</span>
        </div>
        {/* ... (optional menu button) ... */}
      </div>

      {/* Image carousel */}
      {hasImages && (
        <div className="relative w-full flex justify-center items-center bg-black/5 min-h-[220px] max-h-[220px] overflow-hidden rounded-xl">
          <img
            src={`http://localhost:3002${images[imgIdx]}`}
            alt="Post"
            className="object-cover w-full h-full"
            style={{ minHeight: 220, maxHeight: 220, objectFit: 'cover' }}
          />
          {images.length > 1 && (
            <>
              <button
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-1 shadow hover:bg-white"
                onClick={() => setImgIdx((i) => (i === 0 ? images.length - 1 : i - 1))}
                aria-label="Previous image"
              >
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" /></svg>
              </button>
              <button
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-1 shadow hover:bg-white"
                onClick={() => setImgIdx((i) => (i === images.length - 1 ? 0 : i + 1))}
                aria-label="Next image"
              >
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" /></svg>
              </button>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                {images.map((_, i) => (
                  <span
                    key={i}
                    className={`inline-block w-2 h-2 rounded-full ${i === imgIdx ? 'bg-white' : 'bg-gray-300'}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Content */}
      <div className="px-4 py-3">
        <p className="mb-2 text-base text-gray-900 whitespace-pre-line">{post.content}</p>
        {post.tripDetails && (
          <p className="mt-1 font-semibold text-gray-700">
            Trip: {post.tripDetails.location}
          </p>
        )}
        {/* Actions */}
        <div className="flex gap-6 items-center mt-2 mb-1">
          <button
            className="flex items-center gap-1 text-gray-700 hover:text-blue-600"
            onClick={() => setShowComments((v) => !v)}
          >
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>
            <span className="text-sm">{showComments ? 'Hide' : 'View'} Comments ({post.comments.length})</span>
          </button>
        </div>
        {/* Comments */}
        {showComments && (
          <div className="mt-2 bg-gray-50 rounded p-2 max-h-40 overflow-y-auto">
            {post.comments.length === 0 ? (
              <p className="text-sm text-gray-500">No comments</p>
            ) : (
              post.comments.map((c) => (
                <div key={c._id} className="flex items-start gap-2 mb-1">
                  <span className="font-semibold text-gray-800">{c.username}:</span>
                  <span className="text-gray-700">{c.content}</span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PostOrTweetCard;
