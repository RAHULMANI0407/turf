import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from './lib/firebase.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { bookingId } = req.body;

  if (!bookingId) {
    return res.status(400).json({ error: 'bookingId required' });
  }

  try {
    await db.collection('bookings').doc(bookingId).update({
      status: 'cancelled',
      cancelledAt: Date.now(),
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to unlock slot' });
  }
}
