import admin from 'firebase-admin';

// Initialize Firebase only if environment variables are present to avoid crashes
if (!admin.apps.length) {
  try {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;

    if (projectId && clientEmail && privateKey) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          // Handle newline characters in private key for Vercel environment variables
          privateKey: privateKey.replace(/\\n/g, '\n'),
        }),
      });
    } else {
      console.warn("Firebase environment variables (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY) are missing. DB operations will fail gracefully.");
    }
  } catch (error) {
    console.error("Firebase initialization failed:", error);
  }
}

// Export db safely; it might be null if init failed
const db = admin.apps.length ? admin.firestore() : null;

export { db };
