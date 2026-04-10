// firebaseConfig.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDJmfSbBmJzv-S2xW5aybnkn7_Vb2CY98s",
  authDomain: "wherewewere-bd6f1.firebaseapp.com",
  projectId: "wherewewere-bd6f1",
  storageBucket: "wherewewere-bd6f1.firebasestorage.app",
  messagingSenderId: "1092094801496",
  appId: "1:1092094801496:web:fa46bbbd29333c20207c2d"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);