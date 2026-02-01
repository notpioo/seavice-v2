
import * as admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Initialize Firebase Admin
const serviceAccount = JSON.parse(
    readFileSync(resolve(process.cwd(), 'serviceAccountKey.json'), 'utf8')
);

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
    });
}

const db = admin.firestore();

async function setAdmin(email: string) {
    console.log(`🔍 Looking for user with email: ${email}...`);

    const snapshot = await db.collection('users').where('email', '==', email).get();

    if (snapshot.empty) {
        console.log('❌ User not found!');
        process.exit(1);
    }

    const userDoc = snapshot.docs[0];
    await userDoc.ref.update({
        role: 'admin',
        updatedAt: new Date().toISOString()
    });

    console.log(`✅ Successfully updated role to 'admin' for user: ${email} (${userDoc.id})`);
    process.exit(0);
}

// Ganti email ini dengan email login kamu jika berbeda
const targetEmail = "admin@gmail.com";

setAdmin(targetEmail).catch(console.error);
