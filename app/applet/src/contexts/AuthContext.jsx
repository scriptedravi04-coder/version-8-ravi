import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { auth, db, googleProvider } from "../lib/firebase";
import { signInWithPopup, signOut, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDocRef = doc(db, "users", firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          let userData = {
            id: firebaseUser.uid,
            user_id: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName,
            picture: firebaseUser.photoURL,
            role: "creator", // default
            onboarded: false
          };

          if (userDoc.exists()) {
            userData = { ...userData, ...userDoc.data() };
          } else {
            await setDoc(userDocRef, userData);
          }
          
          // Fallback to local storage token for backend compatibility if needed
          localStorage.setItem("ybex_token", firebaseUser.uid);
          
          setUser(userData);
        } catch (error) {
          console.error("Error fetching user data from Firestore:", error);
          setUser(null);
        }
      } else {
        setUser(null);
        localStorage.removeItem("ybex_token");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      setLoading(true);
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Error signing in with Google:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const refreshUser = async () => {
    if (auth.currentUser) {
      const userDocRef = doc(db, "users", auth.currentUser.uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        setUser(prev => ({ ...prev, ...userDoc.data() }));
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginWithGoogle, logout, refreshUser, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
