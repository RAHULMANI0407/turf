import type { VercelRequest, VercelResponse } from '@vercel/node';
import Razorpay from 'razorpay';
import { db } from './lib/firebase.js';
import { v4 as uuidv4 } from 'uuid';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || '',
});

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, date, slotIds, amount } = req.body;

  if (!name || !date || !Array.isArray(slotIds) || slotIds.length === 0 || !amount) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (!db) {
    return res.status(503).json({ error: 'Database not connected' });
  }

  try {
    /* ---------- DOUBLE BOOKING CHECK ---------- */
    const bookingsRef = db.collection('bookings');
    const snapshot = await bookingsRef
      .where('date', '==', date)
      .where('status', 'in', ['pending', 'confirmed'])
      .get();

    const now = Date.now();
    let conflict = false;

    snapshot.forEach(doc => {
      const data = doc.data();

      // ignore expired pending locks (10 mins)
      if (
        data.status === 'pending' &&
        now - data.createdAt > 10 * 60 * 1000
      ) {
        return;
      }

      const overlap = data.slotIds.some((id: string) =>
        slotIds.includes(id)
      );
      if (overlap) conflict = true;
    });

    if (conflict) {
      return res
        .status(409)
        .json({ error: 'Slot already booked. Try another.' });
    }

    /* ---------- CREATE RAZORPAY ORDER ---------- */
    const order = await razorpay.orders.create({
      amount: amount * 100, // paisa
      currency: 'INR',
      receipt: uuidv4(),
      payment_capture: 1,
    });

    /* ---------- LOCK SLOT (PENDING) ---------- */
    await db.collection('bookings').add({
      turfId: 'main-turf',
      customerName: name,
      date,
      slotIds,
      amount,
      status: 'pending',
      orderId: order.id,
      createdAt: now,
    });

    /* ---------- RESPONSE (MATCH FRONTEND) ---------- */
    return res.status(200).json({
      id: order.id,
      amount: order.amount,
    });
  } catch (err) {
    console.error('Create order error:', err);
    return res.status(500).json({ error: 'Failed to create order' });
  }
}
