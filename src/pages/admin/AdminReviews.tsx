import React, { useState, useEffect } from 'react';
import { MessageSquare, Star, Trash2, CheckCircle2, Search } from 'lucide-react';
import { Review } from '../../types/index.js';
import { useToast } from '../../context/ToastContext.js';
import api from '../../services/api.js';

export const AdminReviews: React.FC = () => {
  const { success, error } = useToast();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [ratingFilter, setRatingFilter] = useState('all');

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/reviews');
      if (res.data?.success) {
        setReviews(res.data.reviews);
      }
    } catch (err: any) {
      error('Failed to load reviews.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleDelete = async (productId: string, reviewId: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this customer review?')) return;
    try {
      const res = await api.delete(`/admin/reviews/${productId}/${reviewId}`);
      if (res.data?.success) {
        success('Review deleted.');
        setReviews(reviews.filter(r => r._id !== reviewId));
      }
    } catch (err: any) {
      error(err.message || 'Failed to delete review.');
    }
  };

  const filteredReviews = reviews.filter(r => {
    if (ratingFilter === 'all') return true;
    return r.rating === parseInt(ratingFilter, 10);
  });

  return (
    <div className="p-6 sm:p-8 lg:p-10 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight">
            Customer Reviews & Ratings Moderation
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            Review customer feedback, verified purchase badges, and moderate testimonials
          </p>
        </div>

        <select
          value={ratingFilter}
          onChange={e => setRatingFilter(e.target.value)}
          className="bg-white border border-zinc-200 rounded-xl px-3.5 py-2 text-xs font-bold text-zinc-700 shadow-sm"
        >
          <option value="all">All Star Ratings</option>
          <option value="5">5 Stars</option>
          <option value="4">4 Stars</option>
          <option value="3">3 Stars</option>
          <option value="2">2 Stars</option>
          <option value="1">1 Star</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredReviews.map(r => (
          <div
            key={r._id}
            className="bg-white rounded-3xl p-6 border border-zinc-200 shadow-sm space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-bold text-sm text-zinc-900 line-clamp-1">{r.productName}</h4>
                  <span className="text-[11px] text-zinc-400">By {r.userName} • {new Date(r.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < r.rating ? 'fill-amber-400 text-amber-400' : 'text-zinc-200'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <p className="text-xs text-zinc-600 leading-relaxed bg-zinc-50 p-3.5 rounded-2xl border border-zinc-100 italic">
                "{r.comment}"
              </p>

              {r.verifiedPurchase && (
                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
                  <CheckCircle2 className="w-3 h-3" /> Verified Buyer
                </span>
              )}
            </div>

            <div className="pt-3 border-t border-zinc-100 flex justify-end">
              <button
                onClick={() => handleDelete(r.productId, r._id)}
                className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-rose-50 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" /> Remove Review
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
