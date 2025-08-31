
import React, { useState } from 'react';
import { createPost } from '../services/apiService';

const NewPost = () => {
  const [content, setContent] = useState('');
  const [type, setType] = useState('post');
  const [location, setLocation] = useState('');
  const [dates, setDates] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [images, setImages] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const formData = new FormData();
      formData.append('content', content);
      formData.append('type', type);
      formData.append('isPublic', isPublic);
      if (type === 'tweet') {
        formData.append('location', location);
        formData.append('dates', dates);
      }
      for (let i = 0; i < images.length; i++) {
        formData.append('images', images[i]);
      }
      await createPost(formData);
      setSuccess('Post created!');
      setContent('');
      setType('post');
      setLocation('');
      setDates('');
      setIsPublic(true);
      setImages([]);
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating post');
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4 bg-gradient-to-br from-green-50 to-white min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-green-700 tracking-tight flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 1.343-3 3 0 1.657 1.343 3 3 3s3-1.343 3-3c0-1.657-1.343-3-3-3zm0 0V4m0 7v7m0 0H7m5 0h5" /></svg>
        Create New Post
      </h1>
      <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-xl shadow p-6">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind?"
          className="w-full border border-green-200 rounded-lg p-3 focus:ring-2 focus:ring-green-400 focus:outline-none"
          rows={3}
        />
        <div className="flex gap-4 items-center">
          <label className="font-semibold">Type:</label>
          <select value={type} onChange={(e) => setType(e.target.value)} className="border border-green-200 rounded-lg p-2">
            <option value="post">Post</option>
            <option value="tweet">Trip Tweet</option>
          </select>
        </div>
        {type === 'tweet' && (
          <>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Trip Location"
              className="w-full border border-green-200 rounded-lg p-2 focus:ring-2 focus:ring-green-400 focus:outline-none"
            />
            <input
              value={dates}
              onChange={(e) => setDates(e.target.value)}
              placeholder="Trip Dates (comma separated)"
              className="w-full border border-green-200 rounded-lg p-2 focus:ring-2 focus:ring-green-400 focus:outline-none"
            />
          </>
        )}
        <div>
          <label className="font-semibold">Images:</label>
          <input type="file" multiple onChange={e => setImages([...e.target.files])} className="block mt-1" />
        </div>
        <div className="flex gap-4 items-center">
          <label className="font-semibold">Visibility:</label>
          <select value={isPublic} onChange={e => setIsPublic(e.target.value === 'true')} className="border border-green-200 rounded-lg p-2">
            <option value="true">Public</option>
            <option value="false">Private</option>
          </select>
        </div>
        {error && <div className="text-red-500">{error}</div>}
        {success && <div className="text-green-600">{success}</div>}
        <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold shadow hover:bg-green-700 transition">Post</button>
      </form>
    </div>
  );
};

export default NewPost;