import { useEffect, useState } from "react";

declare global {
  interface Window {
    Razorpay: any;
  }
}

type Slot = {
  _id: string;
  time: string;
  isBooked: boolean;
};

export default function App() {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);

  const fetchSlots = async () => {
    try {
      const res = await fetch("/api/get-slots");
      const data = await res.json();
      setSlots(data || []);
    } catch {
      setSlots([]);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, []);

  const payNow = async () => {
    if (!selectedSlot) return alert("Select slot");

    const order = await fetch("/api/create-order", { method: "POST" }).then(r =>
      r.json()
    );

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
            slotId: selectedSlot._id,
            paymentId: res.razorpay_payment_id,
          }),
        });

        alert("Booked");
        setSelectedSlot(null);
        fetchSlots();
      },
    }).open();
  };

  return (
    <div className="p-6">
      <h1 className="text-xl mb-4">Select Slot</h1>

      <div className="flex flex-wrap gap-2">
        {slots.map(slot => (
          <button
            key={slot._id}
            disabled={slot.isBooked}
            onClick={() => setSelectedSlot(slot)}
            className={`px-4 py-2 rounded ${
              slot.isBooked
                ? "bg-gray-500"
                : selectedSlot?._id === slot._id
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
        className="mt-4 px-6 py-3 bg-black"
      >
        Pay & Book
      </button>
    </div>
  );
}
