import type { VercelRequest, VercelResponse } from "@vercel/node";
import crypto from "crypto";
import { db } from "./lib/firebase.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    date,
    slots,
    name,
    phone,
    amount,
  } = req.body;

  if (
    !razorpay_order_id ||
    !razorpay_payment_id ||
    !razorpay_signature ||
    !date ||
    !slots
  ) {
    return res.status(400).json({ error: "Missing data" });
  }

  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) {
     return res.status(500).json({ error: "Server misconfiguration: Missing Secret" });
  }

  // 🔐 VERIFY SIGNATURE
  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    return res.status(400).json({ error: "Invalid signature" });
  }

  if (!db) {
      console.error("Database connection failed during payment verification");
      return res.status(500).json({ error: "Database not available" });
  }

  try {
    // ✅ SAVE BOOKING
    const bookingRef = db.collection("bookings").doc(razorpay_order_id);

    await bookingRef.set({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      name,
      phone,
      date,
      slots,
      amount,
      status: "confirmed",
      createdAt: Date.now(),
    });

    // ✅ SAVE / BLOCK SLOTS (GLOBAL)
    const slotRef = db.collection("slots").doc(date);
    const snap = await slotRef.get();

    const existing = snap.exists ? snap.data()!.slots : [];
    const updatedSlots = Array.from(new Set([...existing, ...slots]));

    await slotRef.set({ slots: updatedSlots });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Error saving booking:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
