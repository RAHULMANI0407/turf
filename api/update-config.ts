import type { VercelRequest, VercelResponse } from "@vercel/node";
import { db } from "./lib/firebase.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { password, pricing } = req.body;
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (!db) {
    return res.status(500).json({ error: "Database not available" });
  }

  try {
    await db.collection("config").doc("pricing").set(pricing);
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("update-config error:", err);
    return res.status(500).json({ error: "Failed to update config" });
  }
}
