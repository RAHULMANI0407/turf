import React, { useState, useMemo, useEffect } from 'react';
import { TIME_SLOTS, PRICING, CONTACT_PHONE } from '../constants';
import Button from './Button';
import { Calendar, CheckCircle, MessageCircle, X, Lock } from 'lucide-react';

// Type for storing booked slots in local storage: { "YYYY-MM-DD": ["slot-6", "slot-7"] }
interface BookedSlotsMap {
  [date: string]: string[];
}

const BookingSection: React.FC = () => {
  // Set default date to today, correctly formatted for input type='date'
  const today = new Date().toISOString().split('T')[0];
  
  const [selectedDate, setSelectedDate] = useState<string>(today);
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [name, setName] = useState('');
  
  // Simulated backend state for booked slots
  const [bookedSlotsMap, setBookedSlotsMap] = useState<BookedSlotsMap>({});
  
  // Modal state
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [lastBooking, setLastBooking] = useState<{
    name: string;
    date: string;
    timeRange: string;
    amount: number;
  } | null>(null);

  // Load bookings from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('turf_bookings');
    if (saved) {
      try {
        setBookedSlotsMap(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load bookings", e);
      }
    }
    // Removed pre-seeding of demo slots so the system starts clean.
  }, []);

  // Save bookings to localStorage whenever they change
  const saveBookings = (newMap: BookedSlotsMap) => {
    setBookedSlotsMap(newMap);
    localStorage.setItem('turf_bookings', JSON.stringify(newMap));
  };

  // Get booked slots for currently selected date
  const bookedOnThisDay = useMemo(() => {
    return bookedSlotsMap[selectedDate] || [];
  }, [bookedSlotsMap, selectedDate]);
  
  // Calculate price based on date (weekend vs weekday)
  const isWeekend = useMemo(() => {
    const d = new Date(selectedDate);
    const day = d.getDay();
    return day === 0 || day === 6; // 0 is Sunday, 6 is Saturday
  }, [selectedDate]);

  const hourlyRate = isWeekend ? PRICING.WEEKEND : PRICING.WEEKDAY;
  const totalAmount = selectedSlots.length * hourlyRate;

  const toggleSlot = (id: string) => {
    // Prevent toggling if already booked
    if (bookedOnThisDay.includes(id)) return;

    if (selectedSlots.includes(id)) {
      setSelectedSlots(selectedSlots.filter(s => s !== id));
    } else {
      setSelectedSlots([...selectedSlots, id]);
    }
  };

  const handleBook = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || selectedSlots.length === 0) return;

    // Sort slots by time
    const sortedSlots = TIME_SLOTS
      .filter(slot => selectedSlots.includes(slot.id))
      .sort((a, b) => a.hour - b.hour);

    const timeRange = sortedSlots.map(s => s.label).join(', ');
    
    const message = `Hi, I want to book the turf.%0A%0ADetails:%0AName: *${name}*%0ADate: *${selectedDate}*%0ATime Slots: *${timeRange}*%0ATotal Amount: *₹${totalAmount}*`;
    
    // 1. Mark slots as booked in our local "database"
    const newBookedMap = {
      ...bookedSlotsMap,
      [selectedDate]: [...(bookedSlotsMap[selectedDate] || []), ...selectedSlots]
    };
    saveBookings(newBookedMap);

    // 2. Open WhatsApp
    window.open(`https://wa.me/${CONTACT_PHONE}?text=${message}`, '_blank');
    
    // 3. Show confirmation modal
    setLastBooking({
      name,
      date: selectedDate,
      timeRange,
      amount: totalAmount
    });
    setShowConfirmation(true);

    // 4. Reset selection
    setSelectedSlots([]);
  };

  // Group slots for display
  const groupedSlots = {
    Morning: TIME_SLOTS.filter(s => s.period === 'Morning'),
    Afternoon: TIME_SLOTS.filter(s => s.period === 'Afternoon'),
    Evening: TIME_SLOTS.filter(s => s.period === 'Evening'),
  };

  return (
    <section id="book" className="py-20 bg-slate-900 relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-turf-darker rounded-3xl p-6 md:p-10 shadow-2xl border border-slate-800">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-white mb-2">Book Your Slot</h2>
            <p className="text-gray-400">Select date and time to reserve your game. Locked slots are already booked.</p>
          </div>

          <form onSubmit={handleBook} className="space-y-8">
            {/* Date Selection */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-300">Select Date</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  type="date"
                  min={today}
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setSelectedSlots([]); // Reset selection on date change
                  }}
                  className="block w-full pl-10 pr-3 py-3 border border-slate-700 rounded-xl bg-slate-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-turf-green focus:border-transparent sm:text-sm appearance-none color-scheme-dark"
                />
              </div>
              <p className="text-xs text-turf-green text-right">
                {isWeekend ? 'Weekend Pricing Applied' : 'Weekday Pricing Applied'}
              </p>
            </div>

            {/* Time Slots */}
            <div className="space-y-6">
              <label className="block text-sm font-medium text-gray-300">Select Time Slots (Hourly)</label>
              
              {(Object.keys(groupedSlots) as Array<keyof typeof groupedSlots>).map((period) => (
                <div key={period} className="space-y-3">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center">
                    <span className="mr-2">{period}</span>
                    <div className="h-px bg-slate-800 flex-grow"></div>
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {groupedSlots[period].map((slot) => {
                      const isSelected = selectedSlots.includes(slot.id);
                      const isBooked = bookedOnThisDay.includes(slot.id);
                      
                      return (
                        <button
                          key={slot.id}
                          type="button"
                          disabled={isBooked}
                          onClick={() => toggleSlot(slot.id)}
                          className={`
                            relative py-2.5 px-3 text-xs sm:text-sm rounded-lg border text-center transition-all duration-200
                            ${isBooked 
                              ? 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed grayscale' 
                              : isSelected 
                                ? 'bg-turf-green border-turf-green text-turf-darker font-bold shadow-lg shadow-turf-green/20' 
                                : 'bg-slate-800 border-slate-700 text-gray-300 hover:border-turf-green/50 hover:bg-slate-700'}
                          `}
                        >
                          {isBooked ? (
                            <div className="flex items-center justify-center">
                              <Lock className="w-3 h-3 mr-1.5 opacity-50" />
                              <span className="line-through">Booked</span>
                            </div>
                          ) : (
                            <>
                              {isSelected && <CheckCircle className="w-4 h-4 absolute -top-1.5 -right-1.5 bg-white text-turf-green rounded-full z-10" />}
                              {slot.label}
                            </>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Name Input */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-300">Your Name / Team Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Thunder Strikers FC"
                className="block w-full px-4 py-3 border border-slate-700 rounded-xl bg-slate-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-turf-green focus:border-transparent"
              />
            </div>

            {/* Summary & Action */}
            <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 flex flex-col md:flex-row justify-between items-center gap-6">
              <div>
                <p className="text-gray-400 text-sm">Total Amount</p>
                <div className="text-3xl font-bold text-white">
                  ₹{totalAmount} <span className="text-sm font-normal text-gray-500">/ {selectedSlots.length} hours</span>
                </div>
              </div>
              
              <Button 
                type="submit" 
                fullWidth 
                className="md:w-auto md:min-w-[200px]"
                disabled={selectedSlots.length === 0 || !name}
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Confirm via WhatsApp
              </Button>
            </div>
            <p className="text-center text-xs text-gray-500">
              By clicking confirm, slots will be blocked and you'll be redirected to WhatsApp.
            </p>
          </form>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && lastBooking && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={() => setShowConfirmation(false)}
          ></div>
          
          {/* Modal Content */}
          <div className="relative bg-slate-900 border border-slate-700 rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl animate-[fadeIn_0.2s_ease-out]">
            <button 
              onClick={() => setShowConfirmation(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-turf-green/20 rounded-full flex items-center justify-center mb-5 ring-2 ring-turf-green/20">
                <CheckCircle className="w-8 h-8 text-turf-green" />
              </div>
              
              <h3 className="text-2xl font-bold text-white mb-2">Booking Initiated!</h3>
              <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                We have marked these slots as booked and redirected you to WhatsApp. Please hit "Send" in the chat to confirm with the management.
              </p>
              
              <div className="w-full bg-slate-800/50 rounded-xl p-5 mb-6 border border-slate-700 text-left space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Name</span>
                  <span className="text-white font-medium">{lastBooking.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Date</span>
                  <span className="text-white font-medium">{lastBooking.date}</span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-gray-400 text-sm mt-0.5">Time</span>
                  <span className="text-white font-medium text-right max-w-[60%] text-sm">{lastBooking.timeRange}</span>
                </div>
                <div className="border-t border-slate-700/50 pt-3 mt-1 flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Total Amount</span>
                  <span className="text-turf-green font-bold text-lg">₹{lastBooking.amount}</span>
                </div>
              </div>
              
              <Button fullWidth onClick={() => setShowConfirmation(false)}>
                Awesome, Got it!
              </Button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </section>
  );
};

export default BookingSection;
