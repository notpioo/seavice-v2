import admin from "firebase-admin";

// Initialize Firebase Admin dengan environment variables
function initializeFirebase() {
  // Cek apakah sudah di-initialize
  if (admin.apps.length > 0) {
    return admin.apps[0]!;
  }

  // Untuk production: gunakan FIREBASE_SERVICE_ACCOUNT_BASE64
  // Untuk development: bisa pakai file JSON langsung
  const serviceAccountBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
  
  if (serviceAccountBase64) {
    // Decode base64 service account
    const serviceAccountJson = Buffer.from(serviceAccountBase64, "base64").toString("utf-8");
    const serviceAccount = JSON.parse(serviceAccountJson);
    
    return admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }
  
  // Fallback: coba pakai Application Default Credentials (untuk local dev)
  // atau throw error jika tidak ada credentials
  throw new Error(
    "FIREBASE_SERVICE_ACCOUNT_BASE64 environment variable is not set.\n" +
    "Please set it with your base64-encoded service account JSON."
  );
}

const app = initializeFirebase();
export const firestore = admin.firestore();
export default app;
