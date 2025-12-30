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

function App() {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);

  const fetchSlots = async () => {
    const res = await fetch(`/api/get-slots`);
    const data = await res.json();
    setSlots(data);
  };

  useEffect(() => {
    fetchSlots();
  }, []);

  const payNow = async () => {
    if (!selectedSlot) {
      alert("Select a slot first");
      return;
    }

    const orderRes = await fetch(`/api/create-order`, { method: "POST" });
    const order = await orderRes.json();

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY,
      amount: order.amount,
      currency: "INR",
      order_id: order.id,
      name: "Turf Booking",
      handler: async function (response: any) {
        await fetch(`/api/confirm-booking`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            slotId: selectedSlot._id,
            paymentId: response.razorpay_payment_id,
          }),
        });

        alert("Slot booked successfully");
        setSelectedSlot(null);
        fetchSlots();
      },
    };

    new window.Razorpay(options).open();
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Select Slot</h2>

      <div className="flex flex-wrap gap-2">
        {slots.map((slot) => (
          <button
            key={slot._id}
            disabled={slot.isBooked}
            onClick={() => setSelectedSlot(slot)}
            className={`px-4 py-2 rounded ${
              slot.isBooked
                ? "bg-gray-400 cursor-not-allowed"
                : selectedSlot?._id === slot._id
                ? "bg-green-600 text-white"
                : "bg-blue-600 text-white"
            }`}
          >
            {slot.time} {slot.isBooked ? "(Booked)" : ""}
          </button>
        ))}
      </div>

      <button
        onClick={payNow}
        disabled={!selectedSlot}
        className="mt-4 px-6 py-3 bg-black text-white"
      >
        Pay & Book
      </button>
    </div>
  );
}

export default App;
