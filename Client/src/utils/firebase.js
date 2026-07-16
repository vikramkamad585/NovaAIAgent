
import { initializeApp } from "firebase/app";
import {getAuth, GoogleAuthProvider} from "firebase/auth"

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "novaai-50898.firebaseapp.com",
  projectId: "novaai-50898",
  storageBucket: "novaai-50898.firebasestorage.app",
  messagingSenderId: "1078829089582",
  appId: "1:1078829089582:web:4041b7da99ee13b1cf30bf"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app)
const provider = new GoogleAuthProvider()

export {auth, provider}