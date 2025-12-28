import React, { useState, useEffect, useMemo } from "react";
import { TIME_SLOTS, PRICING, CONTACT_PHONE } from "../constants";
import Button from "./Button";
import { Calendar, CheckCircle, Lock, Loader2 } from "lucide-react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const BookingSection: React.FC = () => {
  const today = new Date().toISOString().split("T")[0];

  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  /* ---------- TIME CHECK ---------- */
  const isPastSlot = (startHour: number) => {
    const now = new Date();
    const [y, m, d] = selectedDate.split("-").map(Number);
    const slotEnd = new Date(y, m - 1, d, startHour + 1, 0, 0);
    return now >= slotEnd;
  };

  /* ---------- LOAD BOOKED SLOTS (GLOBAL) ---------- */
  useEffect(() => {
    const loadSlots = async () => {
      setLoadingSlots(true);
      try {
        const ref = doc(db, "bookings", selectedDate);
        const snap = await getDoc(ref);
        setBookedSlots(snap.exists() ? snap.data().slots || [] : []);
      } catch (err) {
        console.error("Failed to load slots", err);
      } finally {
        setLoadingSlots(false);
      }
    };

    loadSlots();
  }, [selectedDate]);

  /* ---------- PRICING ---------- */
  const isWeekend = useMemo(() => {
    const d = new Date(selectedDate + "T00:00:00");
    return d.getDay() === 0 || d.getDay() === 6;
  }, [selectedDate]);

  const hourlyRate = isWeekend ? PRICING.WEEKEND : PRICING.WEEKDAY;
  const totalAmount = selectedSlots.length * hourlyRate;

  /* ---------- SLOT TOGGLE ---------- */
  const toggleSlot = (id: string) => {
    if (bookedSlots.includes(id)) return;
    setSelectedSlots((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  /* ---------- PAY & BOOK ---------- */
  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || phone.length !== 10 || selectedSlots.length === 0) {
      alert("Enter name, valid phone number, and select slots");
      return;
    }

    setSubmitting(true);

    try {
      // 🔥 SAVE SLOT DIRECTLY TO FIREBASE
      const ref = doc(db, "bookings", selectedDate);
      const snap = await getDoc(ref);

      const existingSlots = snap.exists() ? snap.data().slots || [] : [];
      const updatedSlots = [...new Set([...existingSlots, ...selectedSlots])];

      await setDoc(
        ref,
        {
          slots: updatedSlots,
          name,
          phone,
          updatedAt: Date.now(),
        },
        { merge: true }
      );

      // ✅ UPDATE UI
      setBookedSlots(updatedSlots);
      setSelectedSlots([]);
      setName("");
      setPhone("");

      // ✅ OPEN WHATSAPP
      const timeRange = TIME_SLOTS.filter((s) =>
        updatedSlots.includes(s.id)
      )
        .map((s) => s.label)
        .join(", ");

      const message = `Hi, I want to book the turf.%0A%0AName: *${name}*%0ADate: *${selectedDate}*%0ATime: *${timeRange}*%0ATotal: *₹${totalAmount}*`;
      window.open(`https://wa.me/${CONTACT_PHONE}?text=${message}`, "_blank");

      alert("Booking confirmed 🎉");
    } catch (err) {
      console.error(err);
      alert("Booking failed. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  /* ---------- GROUP SLOTS ---------- */
  const groupedSlots = {
    Morning: TIME_SLOTS.filter((s) => s.period === "Morning"),
    Afternoon: TIME_SLOTS.filter((s) => s.period === "Afternoon"),
    Evening: TIME_SLOTS.filter((s) => s.period === "Evening"),
  };

  /* ---------- UI ---------- */
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
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setSelectedSlots([]);
                  }}
                  className="w-full pl-10 py-3 bg-slate-800 text-white rounded-xl border border-slate-700"
                />
              </div>
            </div>

            {/* SLOTS */}
            <div className={loadingSlots ? "opacity-60 pointer-events-none" : ""}>
              {Object.entries(groupedSlots).map(([period, slots]) => (
                <div key={period} className="mb-6">
                  <h4 className="text-xs uppercase text-gray-500 mb-2">
                    {period}
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {slots.map((slot) => {
                      const closed =
                        bookedSlots.includes(slot.id) ||
                        isPastSlot(slot.hour);

                      const selected = selectedSlots.includes(slot.id);

                      return (
                        <button
                          key={slot.id}
                          type="button"
                          disabled={closed}
                          onClick={() => toggleSlot(slot.id)}
                          className={`relative py-2 px-3 text-sm rounded-lg border
                            ${
                              closed
                                ? "bg-slate-800 text-gray-600 cursor-not-allowed"
                                : selected
                                ? "bg-lime-400 text-black font-bold"
                                : "bg-slate-800 text-gray-300 hover:border-lime-400"
                            }`}
                        >
                          {closed && (
                            <Lock className="w-3 h-3 absolute top-1 right-1" />
                          )}
                          {selected && (
                            <CheckCircle className="w-4 h-4 absolute -top-2 -right-2 bg-white text-lime-500 rounded-full" />
                          )}
                          {isPastSlot(slot.hour) ? "Closed" : slot.label}
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
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full mt-2 py-3 px-4 bg-slate-800 text-white rounded-xl border border-slate-700"
              />
            </div>

            {/* PHONE */}
            <div>
              <label className="text-sm text-gray-300">Mobile Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="10-digit mobile number"
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
                {submitting ? (
                  <Loader2 className="animate-spin w-5 h-5 mr-2" />
                ) : (
                  <Lock className="w-5 h-5 mr-2" />
                )}
                Book Slot
              </Button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default BookingSection;
