import type { VercelRequest, VercelResponse } from "@vercel/node";
import { db } from "./lib/firebase";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { date } = req.query;

    if (!date || typeof date !== "string") {
      return res.status(400).json({ error: "Date is required" });
    }

    const docRef = db.collection("bookings").doc(date);
    const snapshot = await docRef.get();

    if (!snapshot.exists) {
      return res.status(200).json([]);
    }

    const data = snapshot.data();
    return res.status(200).json(data?.slots || []);
  } catch (err) {
    console.error("❌ get-slots error:", err);
    return res.status(500).json({ error: "Failed to fetch slots" });
  }
}
