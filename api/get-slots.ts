import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from './lib/firebase';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { date } = req.query;

  if (!date || typeof date !== 'string') {
    return res.status(400).json({ error: 'Date is required' });
  }

  // Fallback if DB is not connected
  if (!db) {
    return res.status(200).json({ bookedSlots: [] });
  }

  try {
    const bookingsRef = db.collection('bookings');
    const snapshot = await bookingsRef
      .where('date', '==', date)
      .where('status', 'in', ['confirmed', 'pending'])
      .get();

    const bookedSlots: string[] = [];
    const now = Date.now();

    snapshot.forEach((doc) => {
      const data = doc.data();
      
      if (data.status === 'confirmed') {
        bookedSlots.push(...data.slotIds);
      } else if (data.status === 'pending') {
        const isExpired = now - data.createdAt > 10 * 60 * 1000; // 10 minutes
        if (!isExpired) {
          bookedSlots.push(...data.slotIds);
        }
      }
    });

    // Remove duplicates
    const uniqueBookedSlots = [...new Set(bookedSlots)];

    return res.status(200).json({ bookedSlots: uniqueBookedSlots });
  } catch (error) {
    console.error('Error fetching slots:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
