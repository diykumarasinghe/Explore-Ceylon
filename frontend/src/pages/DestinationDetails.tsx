import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTravel } from '../context/TravelContext';
import { PackageCard } from '../components/PackageCard';
import { SectionHeader } from '../components/SectionHeader';
import { MapPin, Calendar, Star, Compass, ArrowLeft, Activity } from 'lucide-react';
import { reviewsApi } from '../services/api';

export const DestinationDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { destinations, packages, currentUser } = useTravel();

  // Reviews State
  const [reviews, setReviews] = useState<any[]>([]);
  const [ratingInput, setRatingInput] = useState(5);
  const [commentInput, setCommentInput] = useState('');
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [editCommentInput, setEditCommentInput] = useState('');
  const [editRatingInput, setEditRatingInput] = useState(5);

  const fetchReviews = async () => {
    if (!id) return;
    try {
      const response = await reviewsApi.getReviews(id);
      setReviews(response.data);
    } catch (err) {
      console.error('Error fetching reviews:', err);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [id]);

  const handleCreateReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim() || !id) return;
    try {
      await reviewsApi.createReview({
        destination: id,
        rating: ratingInput,
        comment: commentInput
      });
      setCommentInput('');
      setRatingInput(5);
      fetchReviews();
    } catch (err) {
      console.error('Error creating review:', err);
    }
  };

  const handleUpdateReview = async (reviewId: string) => {
    try {
      await reviewsApi.updateReview(reviewId, {
        rating: editRatingInput,
        comment: editCommentInput
      });
      setEditingReviewId(null);
      fetchReviews();
    } catch (err) {
      console.error('Error updating review:', err);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    try {
      await reviewsApi.deleteReview(reviewId);
      fetchReviews();
    } catch (err) {
      console.error('Error deleting review:', err);
    }
  };

  // Find current destination
  // TODO: Connect to GET /api/destinations/:id in backend
  const destination = destinations.find(d => d.id === id);

  // Find related packages
  // TODO: Connect to GET /api/packages?destinationId=:id in backend
  const relatedPackages = packages.filter(p => p.destinationId === id);

  if (!destination) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 shadow-xs max-w-lg mx-auto mt-12">
        <h3 className="text-xl font-bold text-deep-navy">Destination Not Found</h3>
        <p className="text-sm text-text-gray mt-2">The destination you are looking for does not exist or has been removed.</p>
        <Link
          to="/destinations"
          className="mt-6 inline-flex items-center space-x-2 bg-primary-blue hover:bg-sky-500 text-white font-bold text-sm px-6 py-2.5 rounded-xl transition-all shadow-md"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Destinations</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-16 space-y-10">
      {/* Back Button (Top-Left Arrow Icon) */}
      <div className="relative">
        <Link
          to="/destinations"
          className="absolute -left-14 top-0 hidden xl:flex items-center justify-center bg-white border border-slate-200 text-slate-600 hover:text-primary-blue hover:border-primary-blue hover:shadow-md rounded-full p-2.5 transition-all shadow-xs w-10 h-10"
          title="Back to Destinations"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        {/* Fallback for smaller screens */}
        <Link
          to="/destinations"
          className="flex xl:hidden items-center justify-center bg-white border border-slate-200 text-slate-600 hover:text-primary-blue hover:border-primary-blue hover:shadow-md rounded-full p-2.5 transition-all shadow-xs w-10 h-10 mb-4 animate-fade-in"
          title="Back to Destinations"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
      </div>

      {/* Main Details Banner */}
      <section className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-0">
        <div className="lg:col-span-5 h-[250px] sm:h-[350px] lg:h-[400px] bg-slate-100">
          <img
            src={destination.image}
            alt={destination.name}
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between">
          <div className="space-y-4">
            <span className="bg-sky-100 text-primary-blue text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider inline-block">
              {destination.category}
            </span>
            
            <h1 className="text-2xl sm:text-3xl font-black text-deep-navy leading-tight">
              {destination.name}
            </h1>

            <div className="flex items-center text-sm text-text-gray space-x-1">
              <MapPin className="h-4 w-4 text-primary-blue shrink-0" />
              <span>{destination.location}</span>
            </div>

            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
              <span className="text-sm font-bold text-slate-800">{destination.rating.toFixed(1)} rating</span>
            </div>

            <p className="text-sm text-text-gray font-medium leading-relaxed pt-2">
              {destination.description}
            </p>
          </div>

          <div className="pt-6 border-t border-slate-100 mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-start space-x-2">
              <Calendar className="h-5 w-5 text-primary-blue shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-deep-navy">Best Time to Visit</h4>
                <p className="text-[11px] text-text-gray font-semibold mt-0.5">{destination.bestTimeToVisit}</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-2">
              <Compass className="h-5 w-5 text-aqua-accent shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-deep-navy">Travel Style</h4>
                <p className="text-[11px] text-text-gray font-semibold mt-0.5">{destination.category} Getaway</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Activities Section */}
      <section className="bg-white border border-slate-100 rounded-3xl p-8 sm:p-10">
        <div className="flex items-center space-x-2 mb-6">
          <div className="p-2 bg-sky-50 rounded-lg text-primary-blue">
            <Activity className="h-5 w-5" />
          </div>
          <h2 className="text-xl font-bold text-deep-navy">Popular Activities in {destination.name}</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {destination.activities.map((activity, index) => (
            <div key={index} className="flex items-center space-x-2.5 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="w-6 h-6 rounded-full bg-primary-blue text-white text-xs font-black flex items-center justify-center shrink-0">
                {index + 1}
              </div>
              <span className="text-sm font-bold text-slate-700">{activity}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Related Packages */}
      <section>
        <SectionHeader
          title={`Featured Packages for ${destination.name}`}
          subtitle="Select from our carefully crafted itineraries featuring accommodation, transport, and guiding."
          badge="Package Deals"
        />

        {relatedPackages.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedPackages.map(pkg => (
              <PackageCard key={pkg.id} pkg={pkg} />
            ))}
          </div>
        ) : (
          <div className="bg-slate-50 rounded-2xl p-8 text-center border border-slate-200">
            <p className="text-slate-500 font-bold text-sm">No packages currently listed for this destination.</p>
            <Link
              to="/packages"
              className="mt-3 inline-flex items-center text-xs font-bold text-primary-blue hover:text-deep-navy transition-colors"
            >
              Browse all available packages instead
            </Link>
          </div>
        )}
      </section>

      {/* Interactive Reviews Section */}
      <section className="bg-white border border-slate-100 rounded-3xl p-8 sm:p-10 space-y-6">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-sky-50 rounded-lg text-primary-blue">
            <Star className="h-5 w-5 fill-primary-blue" />
          </div>
          <h2 className="text-xl font-bold text-deep-navy">Customer Reviews & Ratings</h2>
        </div>

        {/* Review Form (Authenticated Customers) */}
        {currentUser ? (
          <form onSubmit={handleCreateReview} className="bg-slate-50 border border-slate-150 p-6 rounded-2xl space-y-4 text-xs font-semibold text-slate-600">
            <h4 className="text-sm font-bold text-slate-800">Leave your review for {destination.name}</h4>
            
            <div className="flex items-center space-x-2">
              <label>Select Rating *</label>
              <select
                value={ratingInput}
                onChange={(e) => setRatingInput(Number(e.target.value))}
                className="bg-white border border-slate-200 rounded-lg p-1.5 font-bold text-slate-700 focus:outline-none"
              >
                {[5, 4, 3, 2, 1].map(num => (
                  <option key={num} value={num}>{num} Star{num !== 1 && 's'}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label>Review Comment *</label>
              <textarea
                required
                rows={3}
                placeholder="Share your travel experiences, trail conditions, or thoughts..."
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-semibold focus:outline-none focus:border-primary-blue"
              />
            </div>

            <button
              type="submit"
              className="bg-primary-blue hover:bg-sky-500 text-white font-bold px-4 py-2 rounded-lg transition-colors cursor-pointer"
            >
              Submit Review
            </button>
          </form>
        ) : (
          <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 text-xs text-orange-700 font-semibold">
            Please <Link to="/login" className="underline font-bold text-primary-blue">Log In</Link> to write a review.
          </div>
        )}

        {/* Reviews List */}
        <div className="space-y-4">
          {reviews.length > 0 ? (
            reviews.map((rev) => {
              const isAuthor = currentUser && rev.user && (rev.user._id === currentUser.id || rev.user === currentUser.id);
              const authorName = rev.user?.name || 'Explorer';
              const authorAvatar = rev.user?.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80';

              return (
                <div key={rev._id} className="border border-slate-100 rounded-2xl p-5 space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-3">
                      <img src={authorAvatar} alt={authorName} className="w-10 h-10 rounded-full object-cover border border-slate-200" />
                      <div>
                        <h4 className="text-xs font-bold text-slate-800">{authorName}</h4>
                        <div className="flex items-center space-x-1 mt-0.5">
                          <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                          <span className="text-[10px] font-black text-slate-600">{(rev.rating || 5).toFixed(1)}</span>
                        </div>
                      </div>
                    </div>

                    {isAuthor && (
                      <div className="flex space-x-2 text-[10px] font-bold">
                        <button
                          onClick={() => {
                            setEditingReviewId(rev._id);
                            setEditCommentInput(rev.comment);
                            setEditRatingInput(rev.rating);
                          }}
                          className="text-primary-blue hover:underline cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteReview(rev._id)}
                          className="text-red-500 hover:underline cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>

                  {editingReviewId === rev._id ? (
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 space-y-3">
                      <div className="flex items-center space-x-2 text-xs">
                        <label className="font-bold">Edit Rating:</label>
                        <select
                          value={editRatingInput}
                          onChange={(e) => setEditRatingInput(Number(e.target.value))}
                          className="bg-white border border-slate-200 rounded-lg p-1.5 focus:outline-none"
                        >
                          {[5, 4, 3, 2, 1].map(num => (
                            <option key={num} value={num}>{num} Star{num !== 1 && 's'}</option>
                          ))}
                        </select>
                      </div>
                      <textarea
                        rows={2}
                        value={editCommentInput}
                        onChange={(e) => setEditCommentInput(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-primary-blue"
                      />
                      <div className="flex space-x-2 text-xs">
                        <button
                          onClick={() => handleUpdateReview(rev._id)}
                          className="bg-primary-blue hover:bg-sky-500 text-white font-bold px-3 py-1.5 rounded-lg cursor-pointer"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingReviewId(null)}
                          className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold px-3 py-1.5 rounded-lg cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-text-gray font-medium leading-relaxed pl-13">
                      {rev.comment}
                    </p>
                  )}
                </div>
              );
            })
          ) : (
            <p className="text-xs text-slate-400 font-semibold italic text-center py-6">
              No reviews posted for this destination yet. Be the first to share your thoughts!
            </p>
          )}
        </div>
      </section>
    </div>
  );
};
