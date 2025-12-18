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

  // Fallback if DB is not connected (Mock Mode)
  if (!db) {
  return res.status(500).json({ error: 'Database not connected' });
}

  try {
    const bookingsRef = db.collection('bookings');
    
    // Check for conflicts
    const snapshot = await bookingsRef
      .where('date', '==', date)
      .where('status', 'in', ['confirmed', 'pending'])
      .get();
    
    const now = Date.now();
    let isConflict = false;
    const bookedSlotIds = new Set<string>();

    snapshot.forEach(doc => {
      const data = doc.data();
      // If confirmed, it's a blocker
      if (data.status === 'confirmed') {
        data.slotIds.forEach((id: string) => bookedSlotIds.add(id));
      } 
      // If pending, check expiration (10 mins)
      else if (data.status === 'pending') {
        const isExpired = now - data.createdAt > 10 * 60 * 1000;
        if (!isExpired) {
          data.slotIds.forEach((id: string) => bookedSlotIds.add(id));
        }
      }
    });

    // Check if requested slots are taken
    for (const id of slotIds) {
      if (bookedSlotIds.has(id)) {
        isConflict = true;
        break;
      }
    }

    if (isConflict) {
      return res.status(409).json({ error: 'One or more selected slots are already booked.' });
    }

    // Create Booking
    const newBooking = {
      turfId: 'main-turf',
      date,
      slotIds,
      status: 'pending',
      amount,
      customerName: name,
      customerPhone: phone,
      createdAt: now,
      paymentMethod: 'link_manual'
    };

    await bookingsRef.add(newBooking);

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error recording booking:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
