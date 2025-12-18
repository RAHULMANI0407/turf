import React, { useState, useEffect } from 'react';
import { TIME_SLOTS } from '../constants';
import { Booking } from '../types';
import { Loader2, Calendar, CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';
import Button from './Button';

const AdminView: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Refresh interval to update "Expired" status in real-time
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [date]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/get-bookings?date=${date}`);
      if (res.ok) {
        const data = await res.json();
        setBookings(data.bookings || []);
      }
    } catch (error) {
      console.error("Failed to fetch bookings", error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (bookingId: string) => {
    const paymentId = prompt('Enter Payment Reference / Transaction ID (Optional):');
    if (paymentId === null) return; // Cancelled
    
    setActionLoading(bookingId);
    try {
      const res = await fetch('/api/confirm-booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, paymentId })
      });
      
      if (res.ok) {
        // Optimistic update
        setBookings(bookings.map(b => b.id === bookingId ? { ...b, status: 'confirmed', paymentId: paymentId || b.paymentId } : b));
      } else {
        alert('Failed to confirm booking');
      }
    } catch (error) {
      console.error(error);
      alert('Error confirming booking');
    } finally {
      setActionLoading(null);
    }
  };

  const getSlotLabels = (ids: string[]) => {
    return ids.map(id => {
        const slot = TIME_SLOTS.find(s => s.id === id);
        return slot ? slot.label : id;
    }).join(', ');
  };

  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-8 pt-24">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-gray-400 text-sm mt-1">Manage turf bookings and availability</p>
          </div>
          
          <div className="flex items-center space-x-4 bg-slate-900 p-2 rounded-lg border border-slate-800">
            <Calendar className="text-gray-400 w-5 h-5 ml-2" />
            <input 
              type="date" 
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-transparent text-white focus:outline-none text-sm p-1"
            />
            <button 
                onClick={fetchBookings}
                className="bg-turf-green text-turf-darker px-4 py-2 rounded-md text-sm font-bold hover:bg-turf-green_hover transition-colors"
            >
                Refresh
            </button>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-400">
              <thead className="bg-slate-800/50 text-gray-200 uppercase font-semibold text-xs tracking-wider">
                <tr>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4">Time Slots</th>
                  <th className="px-6 py-4 text-right">Amount</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {loading ? (
                    <tr>
                        <td colSpan={6} className="px-6 py-12 text-center">
                            <div className="flex justify-center items-center">
                                <Loader2 className="w-8 h-8 text-turf-green animate-spin" />
                            </div>
                        </td>
                    </tr>
                ) : bookings.length === 0 ? (
                    <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                            No bookings found for {date}
                        </td>
                    </tr>
                ) : (
                    bookings.map((booking) => {
                      const isExpired = booking.status === 'pending' && (now - booking.createdAt > 10 * 60 * 1000);
                      
                      return (
                        <tr key={booking.id} className="hover:bg-slate-800/30 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              {booking.status === 'confirmed' ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900 text-green-200">
                                  <CheckCircle className="w-3 h-3 mr-1" /> Confirmed
                                </span>
                              ) : isExpired ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-700 text-slate-300">
                                  <XCircle className="w-3 h-3 mr-1" /> Expired
                                </span>
                              ) : booking.status === 'pending' ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-900 text-yellow-200">
                                  <Clock className="w-3 h-3 mr-1" /> Pending
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-900 text-red-200">
                                  Failed
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 font-medium text-white">
                              {booking.customerName}
                              <div className="text-xs text-gray-500 font-normal mt-0.5">
                                {new Date(booking.createdAt).toLocaleTimeString()}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              {booking.customerPhone}
                            </td>
                            <td className="px-6 py-4 max-w-xs truncate" title={getSlotLabels(booking.slotIds)}>
                              {getSlotLabels(booking.slotIds)}
                            </td>
                            <td className="px-6 py-4 text-right font-mono text-turf-green">
                              ₹{booking.amount}
                            </td>
                            <td className="px-6 py-4">
                              {booking.status === 'pending' && !isExpired && (
                                <button
                                  onClick={() => booking.id && handleConfirm(booking.id)}
                                  disabled={actionLoading === booking.id}
                                  className="text-xs bg-turf-green/10 text-turf-green border border-turf-green/50 px-3 py-1 rounded hover:bg-turf-green hover:text-turf-darker transition-colors disabled:opacity-50"
                                >
                                  {actionLoading === booking.id ? '...' : 'Confirm Payment'}
                                </button>
                              )}
                              {booking.status === 'confirmed' && booking.paymentId && (
                                <div className="text-xs text-gray-500 font-mono" title="Payment ID">
                                    Ref: {booking.paymentId.substring(0, 8)}...
                                </div>
                              )}
                            </td>
                        </tr>
                      );
                    })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminView;