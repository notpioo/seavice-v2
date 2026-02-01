import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCmGVvlQ8QciED-R6EShzOxuGmZ_hiHKO4",
    authDomain: "seavice-a25e0.firebaseapp.com",
    projectId: "seavice-a25e0",
    storageBucket: "seavice-a25e0.firebasestorage.app",
    messagingSenderId: "243409020515",
    appId: "1:243409020515:web:cfe39747aa24eaacd43a56"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Auth instance
export const auth = getAuth(app);

// Google provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
    prompt: "select_account"
});

export default app;
