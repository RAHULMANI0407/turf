import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from './lib/firebase';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const ref = await db.collection('debug').add({
      message: 'hello from vercel',
      time: Date.now(),
    });

    return res.status(200).json({ success: true, id: ref.id });
  } catch (err: any) {
    console.error('FIRESTORE ERROR:', err);
    return res.status(500).json({ error: err.message });
  }
}
