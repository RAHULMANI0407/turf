import React, { useState, useEffect } from 'react';
import { TIME_SLOTS } from '../constants';
import { Booking } from '../types';
import {
  Loader2,
  Calendar,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';

const AdminView: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  /* 🔐 ADMIN LOGIN PROTECTION (STEP 3) */
  useEffect(() => {
    if (!localStorage.getItem('isAdmin')) {
      window.location.hash = '#admin-login';
    }
  }, []);

  /* ⏱ Refresh timer for expired pending bookings */
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 60000);
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
    } catch (err) {
      console.error('Failed to fetch bookings', err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (bookingId: string) => {
    const paymentId = prompt('Enter Payment Reference (optional)');
    if (paymentId === null) return;

    setActionLoading(bookingId);
    try {
      const res = await fetch('/api/confirm-booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, paymentId }),
      });

      if (res.ok) {
        setBookings(bookings.map(b =>
          b.id === bookingId
            ? { ...b, status: 'confirmed', paymentId: paymentId || b.paymentId }
            : b
        ));
      } else {
        alert('Failed to confirm booking');
      }
    } catch (err) {
      console.error(err);
      alert('Error confirming booking');
    } finally {
      setActionLoading(null);
    }
  };

  const getSlotLabels = (ids: string[]) =>
    ids
      .map(id => TIME_SLOTS.find(s => s.id === id)?.label || id)
      .join(', ');

  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-8 pt-24">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-gray-400 text-sm mt-1">
              Manage turf bookings and availability
            </p>
          </div>

          <div className="flex items-center space-x-4 bg-slate-900 p-2 rounded-lg border border-slate-800">
            <Calendar className="text-gray-400 w-5 h-5 ml-2" />
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="bg-transparent text-white focus:outline-none text-sm p-1"
            />
            <button
              onClick={fetchBookings}
              className="bg-turf-green text-turf-darker px-4 py-2 rounded-md text-sm font-bold hover:bg-turf-green_hover"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <table className="w-full text-left text-sm text-gray-400">
            <thead className="bg-slate-800 text-gray-200 uppercase text-xs">
              <tr>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Phone</th>
                <th className="px-6 py-4">Slots</th>
                <th className="px-6 py-4 text-right">Amount</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <Loader2 className="animate-spin mx-auto text-turf-green" />
                  </td>
                </tr>
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500">
                    No bookings for {date}
                  </td>
                </tr>
              ) : (
                bookings.map(b => {
                  const expired =
                    b.status === 'pending' &&
                    now - b.createdAt > 10 * 60 * 1000;

                  return (
                    <tr key={b.id}>
                      <td className="px-6 py-4">
                        {b.status === 'confirmed' ? (
                          <span className="text-green-400 flex items-center">
                            <CheckCircle className="w-4 h-4 mr-1" /> Confirmed
                          </span>
                        ) : expired ? (
                          <span className="text-gray-400 flex items-center">
                            <XCircle className="w-4 h-4 mr-1" /> Expired
                          </span>
                        ) : (
                          <span className="text-yellow-400 flex items-center">
                            <Clock className="w-4 h-4 mr-1" /> Pending
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-white">
                        {b.customerName}
                      </td>

                      <td className="px-6 py-4">{b.customerPhone}</td>

                      <td className="px-6 py-4 truncate">
                        {getSlotLabels(b.slotIds)}
                      </td>

                      <td className="px-6 py-4 text-right text-turf-green">
                        ₹{b.amount}
                      </td>

                      <td className="px-6 py-4">
                        {b.status === 'pending' && !expired && (
                          <button
                            onClick={() => b.id && handleConfirm(b.id)}
                            disabled={actionLoading === b.id}
                            className="text-xs bg-turf-green/10 text-turf-green border border-turf-green px-3 py-1 rounded"
                          >
                            {actionLoading === b.id ? '...' : 'Confirm'}
                          </button>
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
  );
};

export default AdminView;
