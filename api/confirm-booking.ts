import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../lib/firebase';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { bookingId, paymentId } = req.body;

  if (!bookingId) {
    return res.status(400).json({ error: 'Booking ID is required' });
  }

  try {
    const updateData: any = {
      status: 'confirmed'
    };
    
    // Save Payment ID (UTR/Ref) if provided
    if (paymentId) {
        updateData.paymentId = paymentId;
    }

    await db.collection('bookings').doc(bookingId).update(updateData);

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error confirming booking:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}