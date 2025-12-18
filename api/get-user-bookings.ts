import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from './lib/firebase.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { phone } = req.query;

  if (!phone || typeof phone !== 'string') {
    return res.status(400).json({ error: 'Phone number is required' });
  }

  if (!db) {
    return res.status(200).json({ bookings: [] });
  }

  try {
    const bookingsRef = db.collection('bookings');
    const snapshot = await bookingsRef
      .where('customerPhone', '==', phone)
      .orderBy('date', 'desc')
      .get();

    const bookings = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return res.status(200).json({ bookings });
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
