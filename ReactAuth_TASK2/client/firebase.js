import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';  // Correct import for auth
import { getStorage } from 'firebase/storage';  // If you're using storage

// Firebase configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export the app, auth, and other Firebase services
export { app, getAuth, getStorage };  // Ensure these are named exports
