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
    // Fallback if Firebase credentials aren't set up yet
    return res.status(200).json({ bookings: [] });
  }

  try {
    const bookingsRef = db.collection('bookings');
    
    // Query by 'phone' to match the field name saved in verify-payment.ts
    // We avoid .orderBy('date') in the query to prevent "Missing Index" errors in Firebase
    // until the user manually creates composite indexes.
    const snapshot = await bookingsRef
      .where('phone', '==', phone)
      .get();

    const bookings = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // In-memory sort: Newest date first, then newest created timestamp
    bookings.sort((a: any, b: any) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        if (dateA !== dateB) return dateB - dateA; // Descending date
        return (b.createdAt || 0) - (a.createdAt || 0); // Descending created time
    });

    return res.status(200).json({ bookings });
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
