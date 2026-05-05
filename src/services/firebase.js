// src/services/firebase.js

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyCxNtISW3S5Ka0G4ceWQYT7nDwUBoaK8bI",
    authDomain: "biospark-2b7d8.firebaseapp.com",
    projectId: "biospark-2b7d8",
    storageBucket: "biospark-2b7d8.firebasestorage.app",
    messagingSenderId: "987402095536",
    appId: "1:987402095536:web:537631e2abd94c510b2475",
    measurementId: "G-5R2V6F6D04"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);