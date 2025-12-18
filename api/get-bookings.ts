import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from './lib/firebase';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { date } = req.query;

  try {
    let query = db.collection('bookings').orderBy('createdAt', 'desc');

    if (date && typeof date === 'string') {
      query = query.where('date', '==', date);
    }

    const snapshot = await query.get();
    const bookings = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return res.status(200).json({ bookings });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
