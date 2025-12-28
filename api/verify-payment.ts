import type { VercelRequest, VercelResponse } from "@vercel/node";
import crypto from "crypto";
import { db } from "./lib/firebase"; // adjust path if needed

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      date,
      slots,
      name,
    } = req.body;

    // 🔴 Validate required fields
    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !date ||
      !slots ||
      !Array.isArray(slots)
    ) {
      return res.status(400).json({ error: "Missing required data" });
    }

    // 🔐 Verify signature
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      return res.status(400).json({ error: "Invalid payment signature" });
    }

    // ✅ SAVE BOOKING TO FIREBASE (AFTER PAYMENT CONFIRM)
    const bookingRef = db.collection("bookings").doc(date);

    const snap = await bookingRef.get();
    const existingSlots = snap.exists ? snap.data()?.slots || [] : [];

    const updatedSlots = Array.from(
      new Set([...existingSlots, ...slots])
    );

    await bookingRef.set(
      {
        slots: updatedSlots,
        lastBookedBy: name || "Guest",
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
        status: "confirmed",
        updatedAt: new Date(),
      },
      { merge: true }
    );

    return res.status(200).json({
      success: true,
      slots: updatedSlots,
    });
  } catch (error) {
    console.error("Verify payment error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
