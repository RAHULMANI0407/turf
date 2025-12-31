import type { VercelRequest, VercelResponse } from "@vercel/node";
import { db } from "./lib/firebase.js";
import { PRICING as DEFAULT_PRICING } from "../constants";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Return default if DB not ready
    if (!db) return res.status(200).json(DEFAULT_PRICING);

    const doc = await db.collection("config").doc("pricing").get();
    
    // Safety check: ensure we return a valid object, not undefined/null
    const data = doc.exists ? doc.data() : null;
    
    // Merge with defaults to ensure all keys exist
    const finalPricing = { ...DEFAULT_PRICING, ...(data || {}) };

    return res.status(200).json(finalPricing);
  } catch (err) {
    console.error("get-config error:", err);
    return res.status(200).json(DEFAULT_PRICING);
  }
}
