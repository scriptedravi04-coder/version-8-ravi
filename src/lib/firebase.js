
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCRNpTW6--Gdfa3eUrO6VNyxfaPbHw-MwA",
  authDomain: "practical-minutia-tdckx.firebaseapp.com",
  projectId: "practical-minutia-tdckx",
  storageBucket: "practical-minutia-tdckx.firebasestorage.app",
  messagingSenderId: "490931055582",
  appId: "1:490931055582:web:0ae3befecf92b0d71b8b4f"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, "ai-studio-raviversion8-d2f8a922-e68a-4070-9b27-da9c1cc89da4");
export const googleProvider = new GoogleAuthProvider();
