import { db } from "./lib/firebase.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  try {
    const { date, slots } = req.body;

    if (!date || !Array.isArray(slots)) {
      return res.status(400).json({ success: false });
    }

    const ref = db.collection("slots").doc(date);
    const snap = await ref.get();

    const existing = snap.exists ? snap.data().slots || [] : [];
    const updated = Array.from(new Set([...existing, ...slots]));

    await ref.set({ slots: updated });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("record-booking error:", err);
    return res.status(500).json({ success: false });
  }
}
