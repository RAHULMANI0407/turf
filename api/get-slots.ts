import type { VercelRequest, VercelResponse } from "@vercel/node";
import { db } from "./lib/firebase";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // ✅ ENV CHECK (RUNS EVERY TIME)
  console.log("ENV CHECK", {
    projectId: process.env.FIREBASE_PROJECT_ID,
    email: !!process.env.FIREBASE_CLIENT_EMAIL,
    key: !!process.env.FIREBASE_PRIVATE_KEY,
  });

  try {
    const { date } = req.query;

    if (!date || typeof date !== "string") {
      return res.status(200).json([]);
    }

    const snap = await db.collection("slots").doc(date).get();

    if (!snap.exists) {
      return res.status(200).json([]);
    }

    return res.status(200).json(snap.data()?.slots || []);
  } catch (err: any) {
    console.error("get-slots error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
