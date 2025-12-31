import React, { useState, useEffect, useMemo } from "react";
import { TIME_SLOTS, CONTACT_PHONE } from "../constants";
import Button from "./Button";
import { Calendar, CheckCircle, Lock, Loader2 } from "lucide-react";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface BookingSectionProps {
  pricing: { WEEKDAY: number; WEEKEND: number };
}

const BookingSection: React.FC<BookingSectionProps> = ({ pricing }) => {
  const today = new Date().toISOString().split("T")[0];

  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  /* ---------- TIME CHECK ---------- */
  const isPastSlot = (startHour: number) => {
    // Only check time if selected date is today
    if (selectedDate !== today) return false;
    
    const now = new Date();
    // Assuming hours are in 24h format in TIME_SLOTS
    return now.getHours() >= startHour;
  };

  /* ---------- LOAD BOOKED SLOTS & AUTO REFRESH ---------- */
  useEffect(() => {
    let isMounted = true;
    let intervalId: NodeJS.Timeout;

    const fetchSlots = async (isBackground = false) => {
      if (!isBackground) setLoadingSlots(true);
      try {
        const res = await fetch(`/api/get-slots?date=${selectedDate}`);
        
        // If API route is missing (404) or errors (500), treat as empty slots (offline mode)
        if (!res.ok) {
           if (isMounted && !isBackground) setBookedSlots([]);
           return;
        }

        const data = await res.json();
        if (isMounted) {
            const newBookedSlots = Array.isArray(data) ? data : [];
            setBookedSlots(newBookedSlots);
            
            // If a selected slot was just booked by someone else, remove it from selection
            setSelectedSlots(prev => {
                const filtered = prev.filter(id => !newBookedSlots.includes(id));
                // Optional: You could show a toast here if filtered.length !== prev.length
                return filtered;
            });
        }
      } catch (err) {
        console.warn("Failed to fetch slots, defaulting to available.", err);
        if (isMounted && !isBackground) setBookedSlots([]);
      } finally {
        if (isMounted && !isBackground) setLoadingSlots(false);
      }
    };

    // Initial load
    fetchSlots(false);

    // Poll every 5 seconds
    intervalId = setInterval(() => {
        fetchSlots(true);
    }, 5000);

    return () => { 
        isMounted = false; 
        clearInterval(intervalId);
    };
  }, [selectedDate]);

  /* ---------- PRICING ---------- */
  const isWeekend = useMemo(() => {
    const d = new Date(selectedDate);
    const day = d.getDay();
    return day === 0 || day === 6; // 0 is Sunday, 6 is Saturday
  }, [selectedDate]);

  const hourlyRate = isWeekend ? pricing.WEEKEND : pricing.WEEKDAY;
  const totalAmount = selectedSlots.length * hourlyRate;

  /* ---------- SLOT TOGGLE ---------- */
  const toggleSlot = (id: string) => {
    if (bookedSlots.includes(id)) return;
    setSelectedSlots((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  /* ---------- SUCCESS HANDLER ---------- */
  const handleSuccess = () => {
    setSubmitting(false);
    setShowSuccess(true);
    
    // Keep the stamp visible for 2.5 seconds, then reset
    setTimeout(() => {
      setShowSuccess(false);
      setBookedSlots(prev => [...prev, ...selectedSlots]);
      setSelectedSlots([]);
      setName("");
      setPhone("");
    }, 2500);
  };

  /* ---------- BOOKING FLOW ---------- */
  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || phone.length !== 10 || selectedSlots.length === 0) {
      alert("Enter name, valid phone number, and select slots");
      return;
    }

    setSubmitting(true);

    try {
      // 1. Try to create order
      const orderRes = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: totalAmount }),
      });

      if (!orderRes.ok) {
        throw new Error("Payment initialization failed");
      }

      const orderData = await orderRes.json();
        
      // Open Razorpay
      if (window.Razorpay) {
          const options = {
                key: orderData.key, // Dynamic key from backend
                amount: orderData.amount,
                currency: orderData.currency,
                name: "TurfPro India",
                description: "Turf Booking",
                order_id: orderData.id,
                handler: async function (response: any) {
                    try {
                        // Verify payment
                        const verifyRes = await fetch("/api/verify-payment", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                ...response,
                                date: selectedDate,
                                slots: selectedSlots,
                                name,
                                phone,
                                amount: totalAmount
                            }),
                        });
                        
                        if (verifyRes.ok) {
                            handleSuccess();
                        } else {
                            alert("Payment verified but slot update failed. Contact support.");
                            setSubmitting(false);
                        }
                    } catch (error) {
                         alert("Verification error. Contact support.");
                         setSubmitting(false);
                    }
                },
                prefill: {
                    name: name,
                    contact: phone,
                },
                theme: {
                    color: "#84cc16",
                },
                modal: {
                    ondismiss: function() {
                        setSubmitting(false);
                    }
                }
            };

            const rzp1 = new window.Razorpay(options);
            
            rzp1.on('payment.failed', function (response: any){
                alert(`Payment Failed: ${response.error.description}`);
                setSubmitting(false);
            });

            rzp1.open();
      } else {
           throw new Error("Razorpay SDK not loaded");
      }

    } catch (err) {
      console.error("Booking Error or Fallback:", err);
      // Fallback to WhatsApp if payment fails or API not configured
      const timeRange = TIME_SLOTS.filter((s) =>
        selectedSlots.includes(s.id)
      )
        .map((s) => s.label)
        .join(", ");

      const message = `Hi, I want to book the turf.%0A%0AName: *${name}*%0ADate: *${selectedDate}*%0ATime: *${timeRange}*%0ATotal: *₹${totalAmount}*`;
      
      if (confirm("Online payment unavailable. Continue via WhatsApp?")) {
          window.open(`https://wa.me/${CONTACT_PHONE}?text=${message}`, "_blank");
          // Optionally show success animation here too if we treat WA message as "booking request sent"
          handleSuccess(); 
      } else {
        setSubmitting(false);
      }
    } 
  };

  /* ---------- GROUP SLOTS ---------- */
  const groupedSlots = {
    Morning: TIME_SLOTS.filter((s) => s.period === "Morning"),
    Afternoon: TIME_SLOTS.filter((s) => s.period === "Afternoon"),
    Evening: TIME_SLOTS.filter((s) => s.period === "Evening"),
  };

  return (
    <section id="book" className="py-20 bg-slate-900 relative">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 md:p-10 relative overflow-hidden">
          
          {/* Success Stamp Overlay */}
          {showSuccess && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-[2px] animate-in fade-in duration-300">
               <div className="text-center">
                  <div className="border-8 border-turf-green text-turf-green px-8 py-4 rounded-xl text-5xl md:text-7xl font-black tracking-widest uppercase animate-stamp mix-blend-screen shadow-[0_0_50px_rgba(132,204,22,0.8)]">
                    BOOKED
                  </div>
                  <p className="text-white mt-8 text-xl animate-in slide-in-from-bottom-5 fade-in duration-700 delay-500 font-semibold">
                    See you on the field!
                  </p>
               </div>
            </div>
          )}

          <h2 className="text-3xl font-bold text-center text-white mb-8">
            Book Your Slot
          </h2>

          <form onSubmit={handleBook} className="space-y-8">
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
                  className="w-full pl-10 py-3 bg-slate-800 text-white rounded-xl border border-slate-700 focus:border-lime-500 focus:ring-1 focus:ring-lime-500 outline-none"
                />
              </div>
            </div>

            <div className={loadingSlots ? "opacity-60 pointer-events-none" : ""}>
              {Object.entries(groupedSlots).map(([period, slots]) => (
                <div key={period} className="mb-6">
                  <h4 className="text-xs uppercase text-gray-500 mb-2 font-semibold tracking-wider">
                    {period}
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {slots.map((slot) => {
                      const isBooked = bookedSlots.includes(slot.id);
                      const isPast = isPastSlot(slot.hour);
                      const closed = isBooked || isPast;
                      const selected = selectedSlots.includes(slot.id);

                      return (
                        <button
                          key={slot.id}
                          type="button"
                          disabled={closed}
                          onClick={() => toggleSlot(slot.id)}
                          className={`relative py-3 px-2 text-sm rounded-lg border transition-all duration-200
                            ${
                              closed
                                ? "bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed"
                                : selected
                                ? "bg-lime-500 border-lime-500 text-slate-900 font-bold shadow-[0_0_15px_rgba(132,204,22,0.4)]"
                                : "bg-slate-800 border-slate-700 text-gray-300 hover:border-lime-500 hover:text-white"
                            }`}
                        >
                          {isBooked && (
                            <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 rounded-lg">
                                <span className="text-xs font-bold text-red-500 transform -rotate-12 border border-red-500 px-1 rounded">BOOKED</span>
                            </div>
                          )}
                           {isPast && !isBooked && (
                            <Lock className="w-3 h-3 absolute top-1 right-1 opacity-50" />
                          )}
                          {selected && (
                            <CheckCircle className="w-4 h-4 absolute -top-2 -right-2 bg-white text-lime-600 rounded-full" />
                          )}
                          <span className="relative z-10">{slot.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                <label className="text-sm text-gray-300">Your Name</label>
                <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="John Doe"
                    className="w-full mt-2 py-3 px-4 bg-slate-800 text-white rounded-xl border border-slate-700 focus:border-lime-500 focus:ring-1 focus:ring-lime-500 outline-none"
                />
                </div>

                <div>
                <label className="text-sm text-gray-300">Mobile Number</label>
                <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="9876543210"
                    required
                    pattern="[0-9]{10}"
                    className="w-full mt-2 py-3 px-4 bg-slate-800 text-white rounded-xl border border-slate-700 focus:border-lime-500 focus:ring-1 focus:ring-lime-500 outline-none"
                />
                </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50">
              <div className="mb-4 sm:mb-0">
                <p className="text-gray-400 text-sm">Total Amount</p>
                <p className="text-3xl font-bold text-white">₹{totalAmount}</p>
                {selectedSlots.length > 0 && <p className="text-xs text-lime-400 mt-1">{selectedSlots.length} slots selected</p>}
              </div>

              <Button
                type="submit"
                disabled={selectedSlots.length === 0 || submitting}
                className="w-full sm:w-auto min-w-[200px]"
              >
                {submitting ? (
                  <Loader2 className="animate-spin w-5 h-5 mr-2" />
                ) : (
                  <Lock className="w-5 h-5 mr-2" />
                )}
                {submitting ? "Processing..." : "Confirm Booking"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default BookingSection;
