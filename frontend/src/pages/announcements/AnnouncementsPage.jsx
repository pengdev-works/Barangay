import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import StatusBadge from '../../components/ui/StatusBadge';
import Modal from '../../components/ui/Modal';
import { Plus, Search, Megaphone, Heart, MessageSquare, ThumbsUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDate } from '../../utils/formatters';

import { useAuth } from '../../context/AuthContext';

const AnnouncementsPage = () => {
  const { user } = useAuth();
  const isStaff = user && user.role !== 'Resident';
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'General',
    is_pinned: false,
  });

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await api.get('/announcements');
      if (res.data.success) {
        setAnnouncements(res.data.announcements);
      }
    } catch (err) {
      toast.error('Failed to fetch announcements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/announcements', formData);
      toast.success('Announcement published!');
      setIsModalOpen(false);
      fetchAnnouncements();
    } catch (err) {
      toast.error('Failed to post announcement');
    }
  };

  const handleLike = async (id) => {
    try {
      await api.post(`/announcements/${id}/like`);
      fetchAnnouncements();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Announcements & Community News</h1>
          <p className="text-sm text-slate-500">Official updates, health advisories, and barangay news</p>
        </div>
        {isStaff && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-semibold text-sm shadow-md shadow-brand-600/20 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Create Announcement
          </button>
        )}
      </div>

      {/* Feed */}
      <div className="space-y-6 max-w-4xl">
        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading news feed...</div>
        ) : announcements.length === 0 ? (
          <div className="p-8 text-center text-slate-400">No announcements posted yet</div>
        ) : (
          announcements.map((a) => (
            <div key={a.id} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-sm">
                    <Megaphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{a.title}</h3>
                    <p className="text-xs text-slate-400">Posted by {a.author_name || 'Barangay Office'} • {formatDate(a.published_at)}</p>
                  </div>
                </div>
                {a.is_pinned && (
                  <span className="px-2.5 py-1 text-xs font-semibold text-amber-700 bg-amber-50 rounded-full border border-amber-200">
                    📌 Pinned
                  </span>
                )}
              </div>

              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{a.content}</p>

              <div className="pt-4 border-t border-slate-100 flex items-center gap-6">
                <button
                  onClick={() => handleLike(a.id)}
                  className="flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-brand-600 transition-colors"
                >
                  <ThumbsUp className="w-4 h-4" /> {a.likes_count || 0} Likes
                </button>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                  <MessageSquare className="w-4 h-4" /> {a.comments_count || 0} Comments
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Announcement">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
            >
              <option value="General">General</option>
              <option value="Health">Health Advisory</option>
              <option value="Safety">Public Safety</option>
              <option value="Events">Events</option>
              <option value="Emergency">Emergency</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Content *</label>
            <textarea
              required
              rows="5"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
            ></textarea>
          </div>
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700">
            <input
              type="checkbox"
              checked={formData.is_pinned}
              onChange={(e) => setFormData({ ...formData, is_pinned: e.target.checked })}
              className="rounded text-brand-600"
            /> Pin to top of feed
          </label>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 text-sm font-semibold hover:bg-slate-100 rounded-xl">Cancel</button>
            <button type="submit" className="px-5 py-2 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-500">Publish Post</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AnnouncementsPage;
