// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDT_8kc5fXZ-qZfY4UJV9sNj3Mm8X36E00",
  authDomain: "br-realty-portal.firebaseapp.com",
  projectId: "br-realty-portal",
  storageBucket: "br-realty-portal.firebasestorage.app",
  messagingSenderId: "1013054742843",
  appId: "1:1013054742843:web:28b5bc5acc9fa58641d71e",
  measurementId: "G-3VRPGH0LXW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
