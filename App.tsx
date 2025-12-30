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

  // 🔹 Fetch slots from backend
  const fetchSlots = async () => {
    const res = await fetch("/api/get-slots");
    const data = await res.json();
    setSlots(data);
  };

  useEffect(() => {
    fetchSlots();
  }, []);

  // 🔹 Payment + Booking
  const payNow = async () => {
    if (!selectedSlot) {
      alert("Select a slot first");
      return;
    }

    // 1️⃣ Create Razorpay order
    const orderRes = await fetch("/api/create-order", {
      method: "POST",
    });
    const order = await orderRes.json();

    // 2️⃣ Open Razorpay
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY,
      amount: order.amount,
      currency: "INR",
      order_id: order.id,
      name: "Turf Booking",
      handler: async function (response: any) {
        // 3️⃣ CONFIRM BOOKING (THIS WAS MISSING)
        await fetch("/api/confirm-booking", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            slotId: selectedSlot._id,
            paymentId: response.razorpay_payment_id,
          }),
        });

        alert("Slot booked successfully");
        setSelectedSlot(null);
        fetchSlots(); // refresh → slot blocked
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Select Slot</h2>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {slots.map((slot) => (
          <button
            key={slot._id}
            disabled={slot.isBooked}
            onClick={() => setSelectedSlot(slot)}
            style={{
              padding: "10px 15px",
              background: slot.isBooked
                ? "#ccc"
                : selectedSlot?._id === slot._id
                ? "#4caf50"
                : "#2196f3",
              color: "#fff",
              border: "none",
              cursor: slot.isBooked ? "not-allowed" : "pointer",
            }}
          >
            {slot.time} {slot.isBooked ? "(Booked)" : ""}
          </button>
        ))}
      </div>

      <br />

      <button
        onClick={payNow}
        disabled={!selectedSlot}
        style={{
          padding: "12px 20px",
          background: "#000",
          color: "#fff",
          border: "none",
          cursor: "pointer",
        }}
      >
        Pay & Book
      </button>
    </div>
  );
}

export default App;
