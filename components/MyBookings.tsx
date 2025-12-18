import React, { useState, useEffect } from 'react';
import { Booking } from '../types';
import { TIME_SLOTS } from '../constants';
import Button from './Button';
import { Calendar, Phone, Search, Loader2, CheckCircle, Clock, XCircle, Trophy, ArrowRight } from 'lucide-react';

const MyBookings: React.FC = () => {
  const [phone, setPhone] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);

  // Check if phone is stored in local storage
  useEffect(() => {
    const storedPhone = localStorage.getItem('userPhone');
    if (storedPhone) {
      setPhone(storedPhone);
      handleLogin(storedPhone);
    }
  }, []);

  const handleLogin = (phoneNumber: string = phone) => {
    if (phoneNumber.length >= 10) {
      setIsLoggedIn(true);
      localStorage.setItem('userPhone', phoneNumber);
      fetchBookings(phoneNumber);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userPhone');
    setIsLoggedIn(false);
    setBookings([]);
    setPhone('');
  };

  const fetchBookings = async (phoneNumber: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/get-user-bookings?phone=${phoneNumber}`);
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

  const getSlotLabels = (ids: string[]) => {
    return ids.map(id => {
      const slot = TIME_SLOTS.find(s => s.id === id);
      return slot ? slot.label : id;
    }).join(', ');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900 text-green-200 border border-green-700"><CheckCircle className="w-3 h-3 mr-1" /> Confirmed</span>;
      case 'pending':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-900 text-yellow-200 border border-yellow-700"><Clock className="w-3 h-3 mr-1" /> Payment Pending</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-900 text-red-200 border border-red-700"><XCircle className="w-3 h-3 mr-1" /> Failed</span>;
    }
  };

  const now = new Date();
  const today = now.toISOString().split('T')[0];

  const upcomingBookings = bookings.filter(b => b.date >= today);
  const pastBookings = bookings.filter(b => b.date < today);

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-2xl">
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
              <Trophy className="w-8 h-8 text-turf-green" />
            </div>
            <h1 className="text-2xl font-bold text-white">My Bookings</h1>
            <p className="text-gray-400 mt-2">Enter your phone number to view your match history.</p>
          </div>
          <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-3.5 h-5 w-5 text-gray-500" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="block w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-turf-green focus:border-transparent"
                  placeholder="e.g. 9876543210"
                  required
                />
              </div>
            </div>
            <Button type="submit" fullWidth disabled={phone.length < 10}>
              View Bookings
            </Button>
            <div className="text-center">
              <a href="/" className="text-sm text-gray-500 hover:text-white transition-colors">Back to Home</a>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">My Bookings</h1>
            <p className="text-gray-400 mt-1">Found {bookings.length} booking(s) for {phone}</p>
          </div>
          <button 
            onClick={handleLogout}
            className="text-sm text-gray-400 hover:text-white underline decoration-slate-600 underline-offset-4"
          >
            Logout
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 text-turf-green animate-spin" />
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-slate-900 rounded-2xl p-12 text-center border border-slate-800">
            <Search className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">No bookings found</h3>
            <p className="text-gray-500 mb-6">You haven't made any bookings with this phone number yet.</p>
            <Button onClick={() => window.location.href = '/#book'}>Book Now</Button>
          </div>
        ) : (
          <div className="space-y-10">
            {/* Upcoming Section */}
            {upcomingBookings.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-turf-green uppercase tracking-wider mb-4 flex items-center">
                  <Calendar className="w-5 h-5 mr-2" /> Upcoming Matches
                </h2>
                <div className="grid gap-4">
                  {upcomingBookings.map(booking => (
                    <div key={booking.id} className="bg-slate-900 rounded-xl p-6 border border-slate-800 hover:border-turf-green/30 transition-all shadow-lg">
                      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between md:justify-start gap-3">
                             <span className="text-white font-bold text-lg">{new Date(booking.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                             {getStatusBadge(booking.status)}
                          </div>
                          <p className="text-gray-400 text-sm">{getSlotLabels(booking.slotIds)}</p>
                          <p className="text-gray-500 text-xs mt-1">Team: {booking.customerName}</p>
                        </div>
                        <div className="flex items-center justify-between md:justify-end gap-6 pt-4 md:pt-0 border-t md:border-t-0 border-slate-800">
                          <div className="text-right">
                             <p className="text-gray-400 text-xs">Total Amount</p>
                             <p className="text-2xl font-bold text-white">₹{booking.amount}</p>
                          </div>
                          {booking.status === 'pending' && (
                             <Button 
                               onClick={() => window.open('https://rzp.io/rzp/YQpANrrR', '_blank')}
                               className="px-4 py-2 text-sm"
                             >
                               Pay Now
                             </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Past Section */}
            {pastBookings.length > 0 && (
              <section className="opacity-75">
                <h2 className="text-lg font-semibold text-gray-500 uppercase tracking-wider mb-4">Past Matches</h2>
                 <div className="grid gap-4">
                  {pastBookings.map(booking => (
                    <div key={booking.id} className="bg-slate-900/50 rounded-xl p-5 border border-slate-800">
                      <div className="flex flex-col md:flex-row justify-between md:items-center gap-2">
                        <div>
                          <p className="text-gray-300 font-medium">{new Date(booking.date).toLocaleDateString()}</p>
                          <p className="text-gray-500 text-sm">{getSlotLabels(booking.slotIds)}</p>
                        </div>
                        <div className="flex items-center gap-4">
                           {getStatusBadge(booking.status)}
                           <span className="text-gray-400 font-mono">₹{booking.amount}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;