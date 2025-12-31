import React, { useState, useEffect } from 'react';
import { Lock, Unlock, Save, X, RefreshCw, AlertTriangle } from 'lucide-react';
import Button from './Button';
import { TIME_SLOTS } from '../constants';

interface AdminDashboardProps {
  onClose: () => void;
  currentPricing: { WEEKDAY: number; WEEKEND: number };
  onPricingUpdate: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onClose, currentPricing, onPricingUpdate }) => {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<'slots' | 'pricing'>('slots');
  const [loading, setLoading] = useState(false);

  // Slots Management State
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Pricing State
  const [pricingForm, setPricingForm] = useState(currentPricing);

  // Check Local Storage for session
  useEffect(() => {
    const savedAuth = localStorage.getItem('admin_auth');
    if (savedAuth) {
      setPassword(savedAuth);
      setIsAuthenticated(true);
    }
  }, []);

  // Update form when prop changes
  useEffect(() => {
    setPricingForm(currentPricing);
  }, [currentPricing]);

  // Load slots when date changes
  useEffect(() => {
    if (isAuthenticated && activeTab === 'slots') {
      loadSlots();
    }
  }, [selectedDate, isAuthenticated, activeTab]);

  const loadSlots = async () => {
    setLoadingSlots(true);
    try {
      const res = await fetch(`/api/get-slots?date=${selectedDate}`);
      
      if (!res.ok) {
        console.warn(`Failed to fetch slots: ${res.status}`);
        setBookedSlots([]);
        return;
      }

      const data = await res.json();
      setBookedSlots(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Error loading slots:", e);
      setBookedSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password) {
      // Basic client-side check is implicit; real check happens on API calls
      setIsAuthenticated(true);
      localStorage.setItem('admin_auth', password);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPassword('');
    localStorage.removeItem('admin_auth');
  };

  const toggleSlotLock = async (slotId: string, isLocked: boolean) => {
    if (loading) return;
    const action = isLocked ? 'unlock' : 'lock';
    
    if (action === 'unlock' && !confirm("Are you sure you want to unlock this slot? If a user paid for it, this might cause double booking.")) {
        return;
    }

    // Optimistic update for better UX
    const previousSlots = [...bookedSlots];
    setBookedSlots(prev => action === 'lock' ? [...prev, slotId] : prev.filter(id => id !== slotId));
    setLoading(true);

    try {
      const res = await fetch('/api/admin-slot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password,
          date: selectedDate,
          slotId,
          action
        })
      });

      const contentType = res.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
         const data = await res.json();
         if (res.ok) {
            // Update with actual server state to ensure sync
            if (data.slots && Array.isArray(data.slots)) {
                setBookedSlots(data.slots);
            }
         } else {
            // Revert on API error
            setBookedSlots(previousSlots);
            alert(data.error || 'Action failed');
            if (res.status === 401) handleLogout();
         }
      } else {
         // Revert on non-JSON error
         setBookedSlots(previousSlots);
         const text = await res.text();
         console.error("Non-JSON response:", text);
         alert(`Server error (${res.status}). Please try again.`);
      }

    } catch (e) {
      // Revert on network error
      setBookedSlots(previousSlots);
      console.error(e);
      alert('Network error or server unavailable.');
    } finally {
      setLoading(false);
    }
  };

  const updatePricing = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/update-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password,
          pricing: {
            WEEKDAY: Number(pricingForm.WEEKDAY),
            WEEKEND: Number(pricingForm.WEEKEND)
          }
        })
      });

      if (res.ok) {
        alert('Pricing updated successfully');
        onPricingUpdate();
      } else {
        const data = await res.json().catch(() => ({ error: 'Unknown error' }));
        alert(data.error || 'Update failed');
        if (res.status === 401) handleLogout();
      }
    } catch (e) {
      alert('Network error');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
        <div className="bg-slate-900 border border-slate-700 p-8 rounded-2xl w-full max-w-md shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Admin Access</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white"><X /></button>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-sm text-gray-400">Admin Password</label>
              <input 
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full mt-2 p-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-turf-green outline-none"
                placeholder="Enter password"
              />
            </div>
            <Button fullWidth type="submit">Login</Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[60] bg-slate-950 overflow-y-auto">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8 bg-slate-900 p-4 rounded-xl border border-slate-800 sticky top-0 z-10">
          <h1 className="text-xl md:text-2xl font-bold text-white flex items-center">
            <Lock className="w-6 h-6 text-turf-green mr-2" />
            Admin Dashboard
          </h1>
          <div className="flex gap-4">
            <button onClick={handleLogout} className="text-sm text-red-400 hover:text-red-300">Logout</button>
            <button onClick={onClose} className="text-gray-400 hover:text-white"><X /></button>
          </div>
        </div>

        <div className="flex space-x-4 mb-8 border-b border-slate-800 pb-1">
          <button 
            onClick={() => setActiveTab('slots')}
            className={`pb-3 px-2 text-sm font-medium transition-colors ${activeTab === 'slots' ? 'text-turf-green border-b-2 border-turf-green' : 'text-gray-400 hover:text-white'}`}
          >
            Manage Slots
          </button>
          <button 
             onClick={() => setActiveTab('pricing')}
             className={`pb-3 px-2 text-sm font-medium transition-colors ${activeTab === 'pricing' ? 'text-turf-green border-b-2 border-turf-green' : 'text-gray-400 hover:text-white'}`}
          >
            Pricing Config
          </button>
        </div>

        {activeTab === 'slots' && (
          <div className="animate-in fade-in duration-300">
            <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
               <div className="w-full sm:w-auto">
                  <label className="block text-sm text-gray-400 mb-2">Select Date to Manage</label>
                  <input 
                    type="date" 
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full sm:w-64 p-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-turf-green outline-none"
                  />
               </div>
               <div className="flex items-center text-sm text-gray-400">
                  <span className="w-3 h-3 bg-red-500/20 border border-red-500 rounded-full mr-2"></span> Locked/Booked
                  <span className="w-3 h-3 bg-slate-800 border border-slate-700 rounded-full ml-4 mr-2"></span> Available
               </div>
            </div>

            {loadingSlots ? (
               <div className="flex justify-center py-20"><RefreshCw className="animate-spin text-turf-green" /></div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {TIME_SLOTS.map(slot => {
                  const isLocked = bookedSlots.includes(slot.id);
                  return (
                    <button
                      key={slot.id}
                      onClick={() => toggleSlotLock(slot.id, isLocked)}
                      disabled={loading}
                      className={`relative p-4 rounded-xl border transition-all ${
                        isLocked 
                          ? 'bg-red-500/10 border-red-500/50 hover:bg-red-500/20' 
                          : 'bg-slate-900 border-slate-800 hover:border-turf-green hover:bg-slate-800/80'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                         <span className={`text-xs font-bold px-2 py-1 rounded ${isLocked ? 'bg-red-500 text-white' : 'bg-turf-green text-black'}`}>
                            {isLocked ? 'LOCKED' : 'OPEN'}
                         </span>
                         {isLocked ? <Lock className="w-4 h-4 text-red-400" /> : <Unlock className="w-4 h-4 text-gray-600" />}
                      </div>
                      <p className="text-white text-sm font-medium">{slot.label}</p>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'pricing' && (
          <div className="max-w-xl mx-auto animate-in fade-in duration-300">
             <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl">
                <h3 className="text-xl font-bold text-white mb-6">Update Base Pricing</h3>
                <form onSubmit={updatePricing} className="space-y-6">
                   <div>
                      <label className="text-sm text-gray-400 block mb-2">Weekday Hourly Rate (₹)</label>
                      <input 
                        type="number"
                        value={pricingForm.WEEKDAY}
                        onChange={e => setPricingForm({...pricingForm, WEEKDAY: Number(e.target.value)})}
                        className="w-full p-3 bg-slate-950 border border-slate-700 rounded-lg text-white focus:border-turf-green outline-none"
                      />
                   </div>
                   <div>
                      <label className="text-sm text-gray-400 block mb-2">Weekend Hourly Rate (₹)</label>
                      <input 
                        type="number"
                        value={pricingForm.WEEKEND}
                        onChange={e => setPricingForm({...pricingForm, WEEKEND: Number(e.target.value)})}
                        className="w-full p-3 bg-slate-950 border border-slate-700 rounded-lg text-white focus:border-turf-green outline-none"
                      />
                   </div>
                   
                   <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-lg flex items-start">
                      <AlertTriangle className="w-5 h-5 text-yellow-500 mr-3 flex-shrink-0" />
                      <p className="text-sm text-yellow-200">
                        Changes will reflect immediately for all new bookings. Existing bookings are not affected.
                      </p>
                   </div>

                   <Button type="submit" fullWidth disabled={loading}>
                      {loading ? 'Saving...' : 'Save Configuration'}
                   </Button>
                </form>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
