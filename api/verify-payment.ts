import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';
import { db } from '../lib/firebase';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ error: 'Missing payment details' });
  }

  const secret = process.env.RAZORPAY_KEY_SECRET || '';
  const body = razorpay_order_id + '|' + razorpay_payment_id;

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(body.toString())
    .digest('hex');

  const isAuthentic = expectedSignature === razorpay_signature;

  if (isAuthentic) {
    try {
      // Find the pending booking with this orderId
      const bookingsRef = db.collection('bookings');
      const snapshot = await bookingsRef.where('orderId', '==', razorpay_order_id).limit(1).get();

      if (snapshot.empty) {
        return res.status(404).json({ error: 'Booking not found' });
      }

      const doc = snapshot.docs[0];
      
      // Update status to confirmed
      await doc.ref.update({
        status: 'confirmed',
        paymentId: razorpay_payment_id,
      });

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error updating booking:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    return res.status(400).json({ success: false, error: 'Invalid signature' });
  }
}