import * as admin from 'firebase-admin';

let dbInstance: admin.firestore.Firestore | null = null;

try {
  const hasCreds = process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY;

  if (hasCreds) {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          // Handle newline characters in private key for Vercel env vars
          privateKey: (process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, '\n'),
        }),
      });
    }
    dbInstance = admin.firestore();
  } else {
    console.warn("FIREBASE_CREDENTIALS missing. App running in mock mode.");
  }
} catch (error) {
  console.error("Firebase initialization failed:", error);
}

export const db = dbInstance;