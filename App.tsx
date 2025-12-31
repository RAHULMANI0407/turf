import { useEffect, useState } from "react";

declare global {
  interface Window {
    Razorpay: any;
  }
}

type Slot = {
  time: string;
  isBooked: boolean;
};

export default function App() {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);

  // 🔑 CHANGE DATE AS YOU WANT
  const selectedDate = "2025-01-01";

  const fetchSlots = async () => {
    try {
      const res = await fetch(`/api/get-slots?date=${selectedDate}`);
      const data = await res.json();
      setSlots(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setSlots([]);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, []);

  const payNow = async () => {
    if (!selectedSlot) {
      alert("Select a slot");
      return;
    }

    const order = await fetch("/api/create-order", {
      method: "POST",
    }).then(r => r.json());

    new window.Razorpay({
      key: import.meta.env.VITE_RAZORPAY_KEY,
      amount: order.amount,
      currency: "INR",
      order_id: order.id,
      handler: async (res: any) => {
        await fetch("/api/confirm-booking", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            date: selectedDate,
            time: selectedSlot.time,
            paymentId: res.razorpay_payment_id,
          }),
        });

        alert("Slot booked");
        setSelectedSlot(null);
        fetchSlots();
      },
    }).open();
  };

  return (
    <div className="p-6">
      <h1 className="text-xl mb-4">Select Slot</h1>

      <div className="flex flex-wrap gap-2">
        {slots.length === 0 && (
          <p className="text-gray-400">No slots available</p>
        )}

        {slots.map((slot, i) => (
          <button
            key={i}
            disabled={slot.isBooked}
            onClick={() => setSelectedSlot(slot)}
            className={`px-4 py-2 rounded ${
              slot.isBooked
                ? "bg-gray-600 cursor-not-allowed"
                : selectedSlot?.time === slot.time
                ? "bg-green-600"
                : "bg-blue-600"
            }`}
          >
            {slot.time} {slot.isBooked ? "(Booked)" : ""}
          </button>
        ))}
      </div>

      <button
        onClick={payNow}
        disabled={!selectedSlot}
        className="mt-6 px-6 py-3 bg-black rounded"
      >
        Pay & Book
      </button>
    </div>
  );
}
