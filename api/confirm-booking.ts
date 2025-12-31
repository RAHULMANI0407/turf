import Razorpay from "razorpay";
import mongoose from "mongoose";

// ⚠️ use SAME Slot schema you already use elsewhere
const SlotSchema = new mongoose.Schema({
  time: String,
  isBooked: Boolean,
  paymentId: String,
});

const Slot =
  mongoose.models.Slot || mongoose.model("Slot", SlotSchema);

// Mongo connect (simple & safe)
const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(process.env.MONGO_URI as string);
};

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID as string,
  key_secret: process.env.RAZORPAY_KEY_SECRET as string,
});

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { slotId, paymentId } = req.body;

    if (!slotId || !paymentId) {
      return res.status(400).json({ error: "Missing data" });
    }

    // 1️⃣ Connect DB
    await connectDB();

    // 2️⃣ Verify payment
    const payment = await razorpay.payments.fetch(paymentId);
    if (payment.status !== "captured") {
      return res.status(400).json({ error: "Payment not verified" });
    }

    // 3️⃣ Block slot in DB
await Slot.updateOne(
  { _id: slotId },
  { $set: { isBooked: true, paymentId } }
);

res.status(200).json({ success: true });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
}
