import type { VercelRequest, VercelResponse } from "@vercel/node";
import { db } from "./lib/firebase.js";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  try {
    const { date } = req.query;

    if (!date || typeof date !== "string") {
      return res.status(200).json([]);
    }

    // Fallback if DB is not initialized (missing keys)
    if (!db) {
      console.log("DB not initialized, returning empty slots");
      return res.status(200).json([]);
    }

    const snap = await db.collection("slots").doc(date).get();

    if (!snap.exists) {
      return res.status(200).json([]);
    }

    return res.status(200).json(snap.data()?.slots || []);
  } catch (err: any) {
    console.error("get-slots error:", err);
    // Return empty array on error so frontend doesn't break
    return res.status(200).json([]);
  }
}
