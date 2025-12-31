import type { VercelRequest, VercelResponse } from "@vercel/node";
import { db } from "./lib/firebase.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { password, date, slotId, action } = req.body;
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (!db) {
    return res.status(503).json({ error: "Database not available" });
  }

  try {
    const ref = db.collection("slots").doc(date);
    const snap = await ref.get();
    
    // Initialize slots array safely: if doc doesn't exist or slots field is missing, start with empty array
    const data = snap.exists ? snap.data() : null;
    let slots: string[] = (data && Array.isArray(data.slots)) ? data.slots : [];

    if (action === 'lock') {
      // Add slot if not present
      if (!slots.includes(slotId)) {
        slots.push(slotId);
      }
    } else if (action === 'unlock') {
      // Remove slot
      slots = slots.filter(s => s !== slotId);
    }

    // Save back to Firestore
    await ref.set({ slots });
    
    // Return updated slots list so frontend can sync
    return res.status(200).json({ success: true, slots });
  } catch (err: any) {
    console.error("admin-slot error:", err);
    return res.status(500).json({ error: err.message || "Failed to update slot" });
  }
}
