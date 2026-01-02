import React, { useState } from 'react';
import { X, Phone, Calendar, Clock, Loader2, Receipt } from 'lucide-react';
import Button from './Button';
import { TIME_SLOTS } from '../constants';

interface MyBookingsProps {
  onClose: () => void;
}

const MyBookings: React.FC<MyBookingsProps> = ({ onClose }) => {
  const [phone, setPhone] = useState('');
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const getSlotLabel = (slotId: string) => {
    const slot = TIME_SLOTS.find(s => s.id === slotId);
    return slot ? slot.label : slotId;
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 10) {
        alert("Please enter a valid 10-digit mobile number");
        return;
    }
    
    setLoading(true);
    setHasSearched(false);
    
    try {
        const res = await fetch(`/api/get-user-bookings?phone=${encodeURIComponent(phone.trim())}`);
        if (res.ok) {
            const data = await res.json();
            setBookings(data.bookings || []);
        } else {
            setBookings([]);
        }
    } catch (err) {
        console.error("Error fetching bookings:", err);
        setBookings([]);
    } finally {
        setLoading(false);
        setHasSearched(true);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
        <div className="bg-slate-900 border border-slate-800 w-full max-w-lg max-h-[90vh] rounded-2xl flex flex-col shadow-2xl relative overflow-hidden">
            
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm z-10">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Receipt className="text-turf-green w-5 h-5" /> 
                    My Bookings
                </h2>
                <button 
                    onClick={onClose} 
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-800 text-gray-400 hover:text-white hover:bg-slate-700 transition-all"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-slate-950">
                <form onSubmit={handleSearch} className="mb-8">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">
                        Enter Registered Mobile Number
                    </label>
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Phone className="absolute left-3 top-3.5 w-5 h-5 text-gray-500" />
                            <input 
                                type="tel" 
                                placeholder="9876543210" 
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:border-turf-green outline-none transition-all placeholder:text-gray-600"
                            />
                        </div>
                        <Button type="submit" disabled={loading} className="min-w-[100px]">
                            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Search'}
                        </Button>
                    </div>
                </form>

                {loading ? (
                     <div className="py-12 flex flex-col items-center text-gray-500">
                        <Loader2 className="w-8 h-8 text-turf-green animate-spin mb-3" />
                        <p className="text-sm">Fetching your history...</p>
                    </div>
                ) : hasSearched && bookings.length === 0 ? (
                    <div className="py-12 flex flex-col items-center justify-center text-center border-2 border-dashed border-slate-800 rounded-2xl bg-slate-900/50">
                        <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mb-3">
                            <Receipt className="w-6 h-6 text-gray-600" />
                        </div>
                        <p className="text-gray-300 font-medium">No bookings found</p>
                        <p className="text-xs text-gray-500 mt-1 max-w-[200px]">Check the phone number or make your first booking today!</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {bookings.map((booking) => (
                            <div key={booking.id} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl relative overflow-hidden group hover:border-turf-green/50 transition-all">
                                <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <Receipt className="w-24 h-24 text-white transform rotate-12" />
                                </div>
                                
                                <div className="relative z-10">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded tracking-wider ${
                                                    booking.status === 'confirmed' ? 'bg-turf-green text-black' : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                                                }`}>
                                                    {booking.status}
                                                </span>
                                                <span className="text-xs text-slate-500 font-mono">#{booking.id.slice(-6)}</span>
                                            </div>
                                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                                {new Date(booking.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                            </h3>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xl font-bold text-turf-green">₹{booking.amount}</div>
                                        </div>
                                    </div>
                                    
                                    <div className="border-t border-slate-800/50 pt-3">
                                        <div className="flex items-start gap-3">
                                            <Clock className="w-4 h-4 text-gray-500 mt-1 flex-shrink-0" />
                                            <div className="flex flex-wrap gap-1.5">
                                                {booking.slots && booking.slots.map((sid: string) => (
                                                    <span key={sid} className="bg-slate-800 text-gray-300 px-2 py-1 rounded-md text-xs font-medium border border-slate-700">
                                                        {getSlotLabel(sid)}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};

export default MyBookings;
