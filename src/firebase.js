import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyCJRVxf3caI8Lt2WFPS4Q1AXOOoNCGtMqQ",
    authDomain: "college-complaint-suggestion.firebaseapp.com",
    projectId: "college-complaint-suggestion",
    storageBucket: "college-complaint-suggestion.firebasestorage.app",
    messagingSenderId: "747067885712",
    appId: "1:747067885712:web:b5358852d22471cc8df015"
  };

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);