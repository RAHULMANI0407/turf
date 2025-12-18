import React, { useState, useEffect, useMemo } from 'react';
import { TIME_SLOTS, PRICING, CONTACT_PHONE } from '../constants';
import Button from './Button';
import { Calendar, CheckCircle, MessageCircle, Lock, Loader2 } from 'lucide-react';

const BookingSection: React.FC = () => {
  const today = new Date().toISOString().split('T')[0];

  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [name, setName] = useState('');
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  /* ---------------- FETCH SLOTS FROM BACKEND ---------------- */

  const fetchSlots = async () => {
    setLoadingSlots(true);
    try {
      const res = await fetch(`/api/get-slots?date=${selectedDate}`);
      const data = await res.json();
      setBookedSlots(data.bookedSlots || []);
    } catch (err) {
      console.error('Failed to fetch slots', err);
    } finally {
      setLoadingSlots(false);
    }
  };

  // Fetch on date change + auto refresh
  useEffect(() => {
    fetchSlots();
    const interval = setInterval(fetchSlots, 10000); // every 10 sec
    return () => clearInterval(interval);
  }, [selectedDate]);

  /* ---------------- PRICING ---------------- */

  const isWeekend = useMemo(() => {
    const d = new Date(selectedDate);
    return d.getDay() === 0 || d.getDay() === 6;
  }, [selectedDate]);

  const hourlyRate = isWeekend ? PRICING.WEEKEND : PRICING.WEEKDAY;
  const totalAmount = selectedSlots.length * hourlyRate;

  /* ---------------- SLOT TOGGLE ---------------- */

  const toggleSlot = (id: string) => {
    if (bookedSlots.includes(id)) return;

    setSelectedSlots(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  /* ---------------- BOOK ---------------- */

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || selectedSlots.length === 0) return;

    setSubmitting(true);

    try {
      await fetch('/api/record-booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone: CONTACT_PHONE,
          date: selectedDate,
          slotIds: selectedSlots,
          amount: totalAmount,
        }),
      });

      await fetchSlots();

      const slotsText = TIME_SLOTS
        .filter(s => selectedSlots.includes(s.id))
        .map(s => s.label)
        .join(', ');

      const message = `Hi, I want to book the turf.

Name: ${name}
Date: ${selectedDate}
Slots: ${slotsText}
Amount: ₹${totalAmount}`;

      window.open(
        `https://wa.me/${CONTACT_PHONE}?text=${encodeURIComponent(message)}`,
        '_blank'
      );

      setSelectedSlots([]);
      setName('');
    } catch (err) {
      alert('Booking failed. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  /* ---------------- GROUP SLOTS ---------------- */

  const groupedSlots = {
    Morning: TIME_SLOTS.filter(s => s.period === 'Morning'),
    Afternoon: TIME_SLOTS.filter(s => s.period === 'Afternoon'),
    Evening: TIME_SLOTS.filter(s => s.period === 'Evening'),
  };

  /* ---------------- UI ---------------- */

  return (
    <section id="book" className="py-20 bg-slate-900">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 md:p-10">

          <h2 className="text-3xl font-bold text-center text-white mb-8">
            Book Your Slot
          </h2>

          <form onSubmit={handleBook} className="space-y-8">

            {/* DATE */}
            <div>
              <label className="text-sm text-gray-300">Select Date</label>
              <div className="relative mt-2">
                <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                <input
                  type="date"
                  min={today}
                  value={selectedDate}
                  onChange={e => {
                    setSelectedDate(e.target.value);
                    setSelectedSlots([]);
                  }}
                  className="w-full pl-10 py-3 bg-slate-800 text-white rounded-xl border border-slate-700"
                />
              </div>
            </div>

            {/* SLOTS */}
            <div className={loadingSlots ? 'opacity-60 pointer-events-none' : ''}>
              {Object.entries(groupedSlots).map(([period, slots]) => (
                <div key={period} className="mb-6">
                  <h4 className="text-xs uppercase text-gray-500 mb-2">{period}</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {slots.map(slot => {
                      const isBooked = bookedSlots.includes(slot.id);
                      const isSelected = selectedSlots.includes(slot.id);

                      return (
                        <button
                          key={slot.id}
                          type="button"
                          disabled={isBooked}
                          onClick={() => toggleSlot(slot.id)}
                          className={`relative py-2 px-3 text-sm rounded-lg border
                            ${isBooked
                              ? 'bg-slate-800 text-gray-600 cursor-not-allowed'
                              : isSelected
                              ? 'bg-lime-400 text-black font-bold'
                              : 'bg-slate-800 text-gray-300 hover:border-lime-400'
                            }`}
                        >
                          {isBooked && <Lock className="w-3 h-3 absolute top-1 right-1" />}
                          {isSelected && <CheckCircle className="w-4 h-4 absolute -top-2 -right-2 bg-white text-lime-500 rounded-full" />}
                          {slot.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* NAME */}
            <div>
              <label className="text-sm text-gray-300">Your Name</label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                required
                className="w-full mt-2 py-3 px-4 bg-slate-800 text-white rounded-xl border border-slate-700"
              />
            </div>

            {/* SUMMARY */}
            <div className="flex justify-between items-center bg-slate-800 p-5 rounded-xl">
              <div>
                <p className="text-gray-400 text-sm">Total</p>
                <p className="text-2xl font-bold text-white">₹{totalAmount}</p>
              </div>

              <Button
                type="submit"
                disabled={selectedSlots.length === 0 || submitting}
              >
                {submitting ? <Loader2 className="animate-spin w-5 h-5 mr-2" /> : <MessageCircle className="w-5 h-5 mr-2" />}
                Book via WhatsApp
              </Button>
            </div>

          </form>
        </div>
      </div>
    </section>
  );
};

export default BookingSection;
