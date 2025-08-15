// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, initializeAuth, getReactNativePersistence, GoogleAuthProvider } from "firebase/auth";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD2s20MxbrnWWUFqb9xkwREUp4BKzhDEsA",
  authDomain: "hosteller-c43d5.firebaseapp.com",
  projectId: "hosteller-c43d5",
  storageBucket: "hosteller-c43d5.firebasestorage.app",
  messagingSenderId: "445893591739",
  appId: "1:445893591739:web:d38763a4d44d779d425f9e",
  measurementId: "G-DK4FCWNMTD"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
// Use persistent auth on native via AsyncStorage; web uses default local persistence
export const auth = Platform.OS === 'web'
  ? getAuth(app)
  : initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });

// Google provider for web popup sign-in
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });