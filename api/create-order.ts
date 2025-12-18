import type { VercelRequest, VercelResponse } from '@vercel/node';
import Razorpay from 'razorpay';
import { db } from './lib/firebase';
import { v4 as uuidv4 } from 'uuid';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || '',
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, phone, date, slotIds, amount } = req.body;

  if (!name || !date || !slotIds || slotIds.length === 0) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Safety check: If DB is not connected, fail gracefully
  if (!db) {
    return res.status(503).json({ error: 'Service unavailable: Database not connected.' });
  }

  try {
    // 1. Double Booking Check (Server Side)
    // Fetch all active bookings for this date
    const bookingsRef = db.collection('bookings');
    const snapshot = await bookingsRef
      .where('date', '==', date)
      .where('status', 'in', ['confirmed', 'pending'])
      .get();

    let isConflict = false;
    const now = Date.now();

    snapshot.forEach((doc) => {
      const data = doc.data();
      // Check expiration for pending slots
      if (data.status === 'pending') {
        const isExpired = now - data.createdAt > 10 * 60 * 1000;
        if (isExpired) return; // Skip expired pending bookings
      }
      
      // Check intersection
      const hasOverlap = data.slotIds.some((id: string) => slotIds.includes(id));
      if (hasOverlap) isConflict = true;
    });

    if (isConflict) {
      return res.status(409).json({ error: 'One or more slots have just been booked. Please try again.' });
    }

    // 2. Create Razorpay Order
    const options = {
      amount: amount * 100, // Razorpay expects amount in paisa
      currency: 'INR',
      receipt: uuidv4(),
      payment_capture: 1, // Auto capture
    };

    const order = await razorpay.orders.create(options);

    // 3. Lock Slots (Create Pending Booking)
    await db.collection('bookings').add({
      turfId: 'main-turf',
      date,
      slotIds,
      status: 'pending',
      amount,
      customerName: name,
      customerPhone: phone,
      orderId: order.id,
      createdAt: now,
    });

    return res.status(200).json({ orderId: order.id, keyId: process.env.RAZORPAY_KEY_ID });
  } catch (error) {
    console.error('Error creating order:', error);
    return res.status(500).json({ error: 'Failed to create order' });
  }
}
