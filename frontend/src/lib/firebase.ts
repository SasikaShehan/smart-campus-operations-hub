// Firebase configuration
// TODO: Replace placeholder values with your actual Firebase project config.
// Get it from: Firebase Console → Project Settings → Your apps → Web app → Config
//
// Steps:
// 1. Go to https://console.firebase.google.com/
// 2. Select your project (or create one named "smart-campus-hub")
// 3. Project Settings (gear icon) → General tab → scroll to "Your apps"
// 4. Click "Add app" → Web → copy the firebaseConfig object
// 5. Paste the values in .env.local file like below:
//
// VITE_FIREBASE_API_KEY=your_api_key
// VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
// VITE_FIREBASE_PROJECT_ID=your_project_id
// VITE_FIREBASE_APP_ID=your_app_id

import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Optional: restrict to specific domain
// googleProvider.setCustomParameters({ hd: "sliit.lk" });
