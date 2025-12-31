import type { VercelRequest, VercelResponse } from '@vercel/node';
import { firestore } from 'firebase-admin';
import { db } from './lib/firebase.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { date, phone } = req.query;

  try {
    if (!db) return res.status(200).json({ bookings: [] });

    let query: firestore.Query = db.collection('bookings');

    // Priority filter: Phone (if provided)
    if (phone && typeof phone === 'string' && phone.trim() !== '') {
      query = query.where('phone', '==', phone);
    } 
    // Secondary filter: Date (if provided)
    else if (date && typeof date === 'string' && date.trim() !== '') {
      query = query.where('date', '==', date);
    } 
    // Default: Recent bookings
    else {
      query = query.orderBy('createdAt', 'desc').limit(50);
    }

    const snapshot = await query.get();
    const bookings = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // If we used a 'where' clause, we might not have ordered by createdAt in the query 
    // to avoid composite index requirements. Sort in memory.
    if (phone || date) {
        bookings.sort((a: any, b: any) => (b.createdAt || 0) - (a.createdAt || 0));
    }

    return res.status(200).json({ bookings });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
