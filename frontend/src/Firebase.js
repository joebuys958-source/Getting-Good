import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDoRUhuwEoJWVtMYt1SQWAjlY2jho8sXkY",
  authDomain: "resell-saas.firebaseapp.com",
  projectId: "resell-saas",
  storageBucket: "resell-saas.firebasestorage.app",
  messagingSenderId: "551775226898",
  appId: "1:551775226898:web:a13d7100a95278db1f9ccb"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
