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
    const snap = await docRef.get();

    if (!snap.exists) {
      return res.status(200).json([]);
    }

    const data = snap.data();
    return res.status(200).json(data?.slots || []);
  } catch (error) {
    console.error("GET SLOTS ERROR:", error);
    return res.status(500).json({ error: "Failed to fetch slots" });
  }
}
