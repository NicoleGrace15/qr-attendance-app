// Import Firebase SDKs
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";  
import { getFirestore } from "firebase/firestore";  
import { getStorage } from "firebase/storage"; 
import { getAnalytics } from "firebase/analytics"; 

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAUpz3ZyhM1uNJIo19ffYBr72Ic8zyezok",
  authDomain: "capstone-db1f6.firebaseapp.com",
  projectId: "capstone-db1f6",
  storageBucket: "capstone-db1f6.appspot.com",
  messagingSenderId: "104546612877",
  appId: "1:104546612877:web:626bf273903b7be2ea94c4",
  measurementId: "G-LMK5LW8CF7",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Initialize Analytics (optional, only if running in a browser)
let analytics = null;
if (typeof window !== "undefined") {
  try {
    analytics = getAnalytics(app);
    console.log("✅ Firebase Analytics Initialized");
  } catch (error) {
    console.warn("⚠️ Firebase Analytics could not be initialized:", error);
  }
}

// Debugging logs to confirm Firebase initialization
console.log("✅ Firebase App Initialized:", app);
console.log("✅ Firebase Auth Initialized:", auth);
console.log("✅ Firestore Initialized:", db);
console.log("✅ Firebase Storage Initialized:", storage);

// Export Firebase services
export { app, auth, db, storage, analytics };
