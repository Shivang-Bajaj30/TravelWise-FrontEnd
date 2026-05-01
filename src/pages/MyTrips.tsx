import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getUserTrips, deleteTrip } from '@/lib/api';
import {
  MapPin,
  Calendar,
  Users,
  Sparkles,
  Trash2,
  Eye,
  Plus,
  Loader2,
  AlertCircle,
  DollarSign,
} from 'lucide-react';

interface Trip {
  id: string;
  location: string;
  travelers: number;
  startDate: string;
  endDate: string;
  preferences: string;
  budget?: string;
  places?: { name: string }[];
  hotels?: { name: string }[];
  itinerary?: { day: number; activities: string[] }[];
  costs?: string[];
  transportation?: string[];
  createdAt?: string;
}

const formatDate = (dateStr: string) => {
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

const formatDateRange = (start: string, end: string) => {
  try {
    const s = new Date(start).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    const e = new Date(end).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    return `${s} – ${e}`;
  } catch {
    return `${start} - ${end}`;
  }
};

const getDayCount = (start: string, end: string) => {
  try {
    const s = new Date(start);
    const e = new Date(end);
    const diff = Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(1, diff + 1);
  } catch {
    return null;
  }
};

/** Extract all numbers from cost strings like "Hotel: ₹5,000/night" and sum them */
const getTotalCost = (costs?: string[]): number | null => {
  if (!costs || costs.length === 0) return null;
  let total = 0;
  for (const c of costs) {
    const nums = c.replace(/,/g, '').match(/[\d]+\.?[\d]*/g);
    if (nums) {
      total += nums.reduce((sum, n) => sum + parseFloat(n), 0);
    }
  }
  return total > 0 ? total : null;
};

const MyTrips = () => {
  const navigate = useNavigate();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const token = localStorage.getItem('token');

  const fetchTrips = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getUserTrips();
      // The backend may return an array or { trips: [...] }
      const tripList = Array.isArray(data) ? data : data.trips || data.data || [];
      setTrips(tripList);
    } catch (err: any) {
      console.error('Failed to fetch trips:', err);
      setError(err.message || 'Failed to load trips.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    fetchTrips();
  }, []);

  const handleDelete = async (tripId: string) => {
    if (!confirm('Are you sure you want to delete this trip?')) return;
    setDeletingId(tripId);
    try {
      await deleteTrip(tripId);
      setTrips((prev) => prev.filter((t) => t.id !== tripId));
    } catch (err: any) {
      alert(err.message || 'Failed to delete trip.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleViewTrip = (trip: Trip) => {
    navigate('/itinerary', {
      state: {
        data: {
          places: trip.places,
          hotels: trip.hotels,
          itinerary: trip.itinerary,
          costs: trip.costs,
          transportation: trip.transportation,
        },
        destination: trip.location,
        startDate: trip.startDate,
        endDate: trip.endDate,
        travelers: trip.travelers,
      },
    });
  };

  const handleCreateTrip = () => {
    navigate('/trip-details');
  };

  // ── Not Logged In ──
  if (!token) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="text-6xl mb-6">🔒</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Login Required</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md">
            Please sign in to view and manage your saved trips.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl px-8 py-3 text-white font-bold shadow-lg hover:from-indigo-600 hover:to-purple-700 transition-all"
          >
            Sign In
          </button>
        </motion.div>
      </div>
    );
  }

  // ── Loading ──
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-4" />
        <p className="text-gray-600 dark:text-gray-400">Loading your trips...</p>
      </div>
    );
  }

  // ── Error ──
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 min-h-[60vh]">
        <AlertCircle className="w-10 h-10 text-red-400 mb-4" />
        <p className="text-red-600 dark:text-red-400 mb-4 text-center max-w-md">{error}</p>
        <button
          onClick={fetchTrips}
          className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl px-6 py-3 text-white font-bold shadow-lg hover:from-indigo-600 hover:to-purple-700 transition-all"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="p-5 sm:p-8 max-w-6xl mx-auto min-h-[70vh]">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-4"
      >
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white">
            My Trips
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {trips.length > 0
              ? `You have ${trips.length} saved trip${trips.length !== 1 ? 's' : ''}`
              : 'Manage and review your planned trips'}
          </p>
        </div>
        <button
          onClick={handleCreateTrip}
          className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full px-6 py-2.5 text-white font-semibold shadow-lg shadow-indigo-500/25 hover:from-indigo-600 hover:to-purple-700 hover:shadow-indigo-500/40 transition-all duration-300 text-sm hover:scale-105 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create New Trip
        </button>
      </motion.div>

      {/* Empty State */}
      {trips.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center p-16 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-3xl bg-gray-50/50 dark:bg-gray-800/30"
        >
          <div className="text-6xl mb-6">🧳</div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No trips yet</p>
          <p className="mb-6 text-gray-500 dark:text-gray-400 text-center max-w-md">
            You haven't planned any trips yet. Start by creating a new itinerary.
          </p>
          <button
            onClick={handleCreateTrip}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl px-8 py-3 text-white font-bold shadow-lg hover:from-indigo-600 hover:to-purple-700 transition-all"
          >
            Plan your first trip ✨
          </button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map((trip, i) => {
            const dayCount = getDayCount(trip.startDate, trip.endDate);
            const totalCost = getTotalCost(trip.costs);
            const prefs = trip.preferences
              ? trip.preferences.split(',').map((p) => p.trim()).filter(Boolean)
              : [];

            return (
              <motion.div
                key={trip.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="group bg-white dark:bg-gray-800/60 rounded-2xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700/50 hover:shadow-xl transition-all duration-500 hover:-translate-y-1 flex flex-col"
              >
                {/* Card Header - Location gradient */}
                <div className="relative h-32 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 overflow-hidden">
                  <div className="absolute inset-0 bg-black/10" />
                  {/* Pattern overlay */}
                  <div className="absolute inset-0 opacity-10" style={{
                    backgroundImage: 'radial-gradient(circle at 25% 25%, white 1px, transparent 1px), radial-gradient(circle at 75% 75%, white 1px, transparent 1px)',
                    backgroundSize: '20px 20px',
                  }} />
                  <div className="relative z-10 flex flex-col justify-end h-full p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin className="w-4 h-4 text-white/80" />
                      <h3 className="text-lg font-bold text-white capitalize truncate">
                        {trip.location}
                      </h3>
                    </div>
                    <p className="text-white/70 text-xs">
                      {formatDateRange(trip.startDate, trip.endDate)}
                    </p>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 flex-1 flex flex-col gap-3">
                  {/* Stats row */}
                  <div className="flex flex-wrap gap-2">
                    {dayCount && (
                      <span className="inline-flex items-center gap-1 text-xs font-medium bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 px-2.5 py-1 rounded-full">
                        <Calendar className="w-3 h-3" />
                        {dayCount} {dayCount === 1 ? 'day' : 'days'}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 text-xs font-medium bg-teal-50 dark:bg-teal-500/10 text-teal-700 dark:text-teal-400 px-2.5 py-1 rounded-full">
                      <Users className="w-3 h-3" />
                      {trip.travelers} {trip.travelers === 1 ? 'traveler' : 'travelers'}
                    </span>
                    {totalCost && (
                      <span className="inline-flex items-center gap-1 text-xs font-medium bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 px-2.5 py-1 rounded-full">
                        <DollarSign className="w-3 h-3" />
                        ₹{totalCost.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>

                  {/* Preferences */}
                  {prefs.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {prefs.slice(0, 4).map((pref, j) => (
                        <span
                          key={j}
                          className="inline-flex items-center gap-1 text-[11px] font-medium bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full"
                        >
                          <Sparkles className="w-2.5 h-2.5" />
                          {pref}
                        </span>
                      ))}
                      {prefs.length > 4 && (
                        <span className="text-[11px] text-gray-400 dark:text-gray-500 px-1.5 py-0.5">
                          +{prefs.length - 4} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Created date */}
                  {trip.createdAt && (
                    <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-auto">
                      Created {formatDate(trip.createdAt)}
                    </p>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => handleViewTrip(trip)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2 rounded-xl shadow-md text-sm font-medium hover:from-indigo-600 hover:to-purple-700 transition-all"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View Itinerary
                    </button>
                    <button
                      onClick={() => handleDelete(trip.id)}
                      disabled={deletingId === trip.id}
                      className="p-2 rounded-xl border border-red-200 dark:border-red-500/30 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all disabled:opacity-50"
                      title="Delete trip"
                    >
                      {deletingId === trip.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyTrips;