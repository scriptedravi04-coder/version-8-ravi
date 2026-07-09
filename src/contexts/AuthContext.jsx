
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
            role: "creator", // We will update this if explicitly passed during signup
            onboarded: false
          };

          if (userDoc.exists()) {
            userData = { ...userData, ...userDoc.data() };
          } else {
            // Wait to set doc until we know the role if possible, but default to creator for now
            await setDoc(userDocRef, userData);
          }
          
          localStorage.setItem("ybex_token", firebaseUser.uid);
          setUser(userData);
        } catch (error) {
          console.error("Error fetching user data from Firestore:", error);
          const fallbackUser = {
            id: firebaseUser.uid,
            user_id: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName,
            picture: firebaseUser.photoURL,
            role: "creator",
            onboarded: false
          };
          setUser(fallbackUser);
          localStorage.setItem("ybex_token", firebaseUser.uid);
        }
      } else {
        setUser(null);
        localStorage.removeItem("ybex_token");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async (role = "creator") => {
    try {
      setLoading(true);
      const res = await signInWithPopup(auth, googleProvider);
      
      // If new user, set role immediately
      const userDocRef = doc(db, "users", res.user.uid);
      const userDoc = await getDoc(userDocRef);
      if (!userDoc.exists()) {
        await setDoc(userDocRef, {
            id: res.user.uid,
            user_id: res.user.uid,
            email: res.user.email,
            name: res.user.displayName,
            picture: res.user.photoURL,
            role: role,
            onboarded: false
        }, { merge: true });
      }
      return res.user;
    } catch (error) {
      console.error("Error signing in with Google:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => { try { setLoading(true); const res = await signInWithEmailAndPassword(auth, email, password); return res.user; } catch (error) { console.error("Error signing in with email/password:", error); throw error; } finally { setLoading(false); } };
  const signup = async (email, password, role = "creator") => { try { setLoading(true); const res = await createUserWithEmailAndPassword(auth, email, password); const userDocRef = doc(db, "users", res.user.uid); await setDoc(userDocRef, { id: res.user.uid, user_id: res.user.uid, email: res.user.email, name: res.user.email?.split("@")[0] || "User", role: role, onboarded: false }); return res.user; } catch (error) { console.error("Error signing up with email/password:", error); throw error; } finally { setLoading(false); } };

  const logout = async () => {
    await signOut(auth);
  };

  const refreshUser = async () => {
    if (auth.currentUser) {
      const userDocRef = doc(db, "users", auth.currentUser.uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const u = { ...userDoc.data() };
        setUser(u);
        return u;
      }
    }
    return null;
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginWithGoogle, signup, login, logout, refreshUser, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
