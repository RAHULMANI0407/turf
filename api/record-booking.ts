import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from './lib/firebase.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, phone, date, slotIds, amount } = req.body;

  if (!name || !date || !slotIds || slotIds.length === 0) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (!db) {
    return res.status(500).json({ error: 'Database not connected' });
  }

  try {
    /* ---------------- BLOCK PAST SLOTS (CRITICAL FIX) ---------------- */

    const now = new Date();
    const [y, m, d] = date.split('-').map(Number);

    for (const slotId of slotIds) {
      // slot-14 → 14
      const hour = Number(slotId.replace('slot-', ''));
      const slotEnd = new Date(y, m - 1, d, hour + 1, 0, 0);

      if (now >= slotEnd) {
        return res.status(400).json({
          error: 'Cannot book past time slots',
        });
      }
    }

    /* ---------------- CONFLICT CHECK ---------------- */

    const bookingsRef = db.collection('bookings');
    const snapshot = await bookingsRef
      .where('date', '==', date)
      .where('status', 'in', ['confirmed', 'pending'])
      .get();

    const nowMs = Date.now();
    const bookedSlotIds = new Set<string>();

    snapshot.forEach(doc => {
      const data = doc.data();

      if (data.status === 'confirmed') {
        data.slotIds.forEach((id: string) => bookedSlotIds.add(id));
      } else if (data.status === 'pending') {
        const isExpired = nowMs - data.createdAt > 10 * 60 * 1000;
        if (!isExpired) {
          data.slotIds.forEach((id: string) => bookedSlotIds.add(id));
        }
      }
    });

    for (const id of slotIds) {
      if (bookedSlotIds.has(id)) {
        return res
          .status(409)
          .json({ error: 'One or more selected slots are already booked.' });
      }
    }

    /* ---------------- CREATE BOOKING ---------------- */

    const newBooking = {
      turfId: 'main-turf',
      date,
      slotIds,
      status: 'pending',
      amount,
      customerName: name,
      customerPhone: phone,
      createdAt: nowMs,
      paymentMethod: 'link_manual',
    };

    await bookingsRef.add(newBooking);

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error recording booking:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
