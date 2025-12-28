import type { VercelRequest, VercelResponse } from "@vercel/node";
import Razorpay from "razorpay";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { amount } = req.body;

    if (!amount) {
      return res.status(400).json({ error: "Amount required" });
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });

    const order = await razorpay.orders.create({
      amount: amount * 100, // IMPORTANT: ₹ → paise
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
    });

    return res.status(200).json(order);
  } catch (err) {
    console.error("Create order error:", err);
    return res.status(500).json({ error: "Order creation failed" });
  }
}
