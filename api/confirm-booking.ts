import Razorpay from "razorpay";
import { db } from "./lib/firebase.js";
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Robust checks for payment config
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.warn("Razorpay keys missing");
      return res.status(500).json({ error: "Server misconfiguration" });
  }

  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

  try {
    const { orderId, paymentId } = req.body;

    if (!orderId || !paymentId) {
      return res.status(400).json({ error: "Missing data" });
    }

    // 1️⃣ Verify payment status from Razorpay
    const payment = await razorpay.payments.fetch(paymentId);
    if (payment.status !== "captured") {
      return res.status(400).json({ error: "Payment not verified" });
    }

    if (!db) {
        return res.status(500).json({ error: "Database not connected" });
    }

    // 2️⃣ Update booking in Firebase
    const bookingRef = db.collection('bookings').doc(orderId);
    await bookingRef.update({
        status: 'confirmed',
        paymentId: paymentId,
        confirmedAt: new Date().toISOString()
    });

    res.status(200).json({ success: true });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
}
