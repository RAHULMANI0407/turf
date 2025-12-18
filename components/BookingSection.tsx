import React, { useState, useEffect, useMemo } from 'react';
import { TIME_SLOTS, PRICING } from '../constants';
import Button from './Button';
import { Calendar, CheckCircle, CreditCard, Loader2, Lock } from 'lucide-react';

const BookingSection: React.FC = () => {
  const today = new Date().toISOString().split('T')[0];
  
  const [selectedDate, setSelectedDate] = useState<string>(today);
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [isSlotsLoading, setIsSlotsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  // Fetch slots on date change
  const fetchSlots = async () => {
    setIsSlotsLoading(true);
    try {
      const res = await fetch(`/api/get-slots?date=${selectedDate}`);
      if (res.ok) {
        const data = await res.json();
        setBookedSlots(data.bookedSlots || []);
      }
    } catch (error) {
      console.error("Failed to fetch slots", error);
    } finally {
      setIsSlotsLoading(false);
    }
  };

  useEffect(() => {
    fetchSlots();
    setSelectedSlots([]); // Reset selection on date change
  }, [selectedDate]);
  
  const isWeekend = useMemo(() => {
    const d = new Date(selectedDate);
    const day = d.getDay();
    return day === 0 || day === 6; // 0 is Sunday, 6 is Saturday
  }, [selectedDate]);

  const hourlyRate = isWeekend ? PRICING.WEEKEND : PRICING.WEEKDAY;
  const totalAmount = selectedSlots.length * hourlyRate;

  const toggleSlot = (id: string) => {
    if (bookedSlots.includes(id)) return; // Prevent selecting booked slots
    
    if (selectedSlots.includes(id)) {
      setSelectedSlots(selectedSlots.filter(s => s !== id));
    } else {
      setSelectedSlots([...selectedSlots, id]);
    }
  };

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !phone || selectedSlots.length === 0) return;
    setIsSubmitting(true);

    try {
        // Create an AbortController to timeout the request if it takes too long (e.g. 8 seconds)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        // 1. Reserve the slot in Database (Status: Pending)
        const res = await fetch('/api/record-booking', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name,
                phone,
                date: selectedDate,
                slotIds: selectedSlots,
                amount: totalAmount
            }),
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);

        if (!res.ok) {
            let errorMessage = "Failed to reserve slots. Please try again.";
            try {
                const data = await res.json();
                errorMessage = data.error || errorMessage;
            } catch (e) {}
            alert(errorMessage);
            setIsSubmitting(false); // Stop loading if API failed
            fetchSlots();
            return;
        }
        
        // 2. Redirect to Payment Link
        // Direct redirect without confirm dialog to prevent "stuck" feeling
        window.location.href = "https://rzp.io/rzp/YQpANrrR";

        // We do NOT set isSubmitting(false) here immediately to prevent the button 
        // from re-enabling while the browser is redirecting.

    } catch (error: any) {
        console.error(error);
        setIsSubmitting(false); // Stop loading on error

        // Fallback: If network timeout or offline, offer manual payment
        if (error.name === 'AbortError' || error.message?.includes('Network')) {
             if (confirm("Connection timed out. Click OK to proceed to payment page directly.")) {
                 window.location.href = "https://rzp.io/rzp/YQpANrrR";
             }
        } else {
             alert("An error occurred. Please check your internet connection.");
        }
    }
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
            <p className="text-gray-400">Select date and time to reserve your game.</p>
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
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-slate-700 rounded-xl bg-slate-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-turf-green focus:border-transparent sm:text-sm appearance-none color-scheme-dark"
                />
              </div>
              <p className="text-xs text-turf-green text-right">
                {isWeekend ? 'Weekend Pricing Applied' : 'Weekday Pricing Applied'}
              </p>
            </div>

             {/* Legend */}
             <div className="flex flex-wrap gap-4 text-sm justify-center">
              <div className="flex items-center"><div className="w-3 h-3 bg-slate-800 border border-slate-700 rounded mr-2"></div><span className="text-gray-400">Available</span></div>
              <div className="flex items-center"><div className="w-3 h-3 bg-turf-green rounded mr-2"></div><span className="text-gray-400">Selected</span></div>
              <div className="flex items-center"><div className="w-3 h-3 bg-red-900/20 border border-red-900/30 rounded mr-2 relative"><Lock className="w-2 h-2 absolute top-0.5 right-0.5 text-red-800"/></div><span className="text-gray-400">Booked</span></div>
            </div>

            {/* Time Slots */}
            <div className={`space-y-6 transition-opacity duration-200 ${isSlotsLoading ? 'opacity-50 pointer-events-none' : ''}`}>
              {(Object.keys(groupedSlots) as Array<keyof typeof groupedSlots>).map((period) => (
                <div key={period} className="space-y-3">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{period}</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {groupedSlots[period].map((slot) => {
                      const isSelected = selectedSlots.includes(slot.id);
                      const isBooked = bookedSlots.includes(slot.id);
                      
                      let btnClass = 'bg-slate-800 border-slate-700 text-gray-300 hover:border-turf-green/50 hover:bg-slate-700';
                      if (isSelected) btnClass = 'bg-turf-green border-turf-green text-turf-darker font-bold shadow-lg shadow-turf-green/20';
                      if (isBooked) btnClass = 'bg-red-900/10 border-red-900/20 text-gray-600 cursor-not-allowed';

                      return (
                        <button
                          key={slot.id}
                          type="button"
                          disabled={isBooked}
                          onClick={() => toggleSlot(slot.id)}
                          className={`
                            relative py-2 px-3 text-sm rounded-lg border text-center transition-all duration-200
                            ${btnClass}
                          `}
                        >
                          {isSelected && <CheckCircle className="w-4 h-4 absolute -top-1.5 -right-1.5 bg-white text-turf-green rounded-full" />}
                          {isBooked && <Lock className="w-3 h-3 absolute top-1 right-1 text-red-900/50" />}
                          {slot.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Name Input */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-300">Name / Team Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Thunder Strikers FC"
                  className="block w-full px-4 py-3 border border-slate-700 rounded-xl bg-slate-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-turf-green focus:border-transparent"
                />
              </div>
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-300">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="10 digit mobile"
                  className="block w-full px-4 py-3 border border-slate-700 rounded-xl bg-slate-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-turf-green focus:border-transparent"
                />
              </div>
            </div>

            {/* Summary & Action */}
            <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 flex flex-col md:flex-row justify-between items-center gap-6">
              <div>
                <p className="text-gray-400 text-sm">Total Amount</p>
                <div className="text-3xl font-bold text-white">
                  ₹{totalAmount.toLocaleString('en-IN')} <span className="text-sm font-normal text-gray-500">/ {selectedSlots.length} hours</span>
                </div>
              </div>
              
              <Button 
                type="submit" 
                fullWidth 
                className="md:w-auto md:min-w-[200px]"
                disabled={selectedSlots.length === 0 || !name || !phone || isSubmitting}
              >
                {isSubmitting ? (
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                    <CreditCard className="w-5 h-5 mr-2" />
                )}
                {isSubmitting ? 'Redirecting...' : 'Proceed to Payment'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default BookingSection;