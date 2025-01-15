import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {

  apiKey: "AIzaSyBaluB-EFja0AEPQJoqI52X1CCsW7cOjyE",
  authDomain: "college-complaint-suggestion.firebaseapp.com",
  projectId: "college-complaint-suggestion",
  storageBucket: "college-complaint-suggestion.firebasestorage.app",
  messagingSenderId: "747067885712",
  appId: "1:747067885712:web:3a5ae7606554a1e88df015",
  measurementId: "G-778CTD0B8J"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);