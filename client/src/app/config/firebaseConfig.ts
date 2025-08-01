// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAqLhlP3sfxsdBXfIDBqY7IxmTKnmiGG2E",
  authDomain: "hosteller-3535b.firebaseapp.com",
  databaseURL: "https://hosteller-3535b-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "hosteller-3535b",
  storageBucket: "hosteller-3535b.firebasestorage.app",
  messagingSenderId: "564183181227",
  appId: "1:564183181227:web:18ba2d9c6315cb45cc14ee",
  measurementId: "G-7137HF6JM7"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);