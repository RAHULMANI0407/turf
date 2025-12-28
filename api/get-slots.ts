import { db } from "./lib/firebase.js";

export default async function handler(req, res) {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(200).json([]);
    }

    const ref = db.collection("slots").doc(date);
    const snap = await ref.get();

    if (!snap.exists) {
      return res.status(200).json([]);
    }

    return res.status(200).json(snap.data().slots || []);
  } catch (err) {
    console.error("get-slots error:", err);
    return res.status(500).json([]);
  }
}
