import { initializeApp, getApps, getApp, FirebaseOptions } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCRmCdM_fmfEe2fFMKgT1TAWEiV8oGHLC4",
  authDomain: "kibo-no-ie.firebaseapp.com",
  databaseURL: "https://kibo-no-ie-default-rtdb.firebaseio.com",
  projectId: "kibo-no-ie",
  storageBucket: "kibo-no-ie.firebasestorage.app",
  messagingSenderId: "394140065481",
  appId: "1:394140065481:web:746725ee5c70cb5513b718",
} satisfies FirebaseOptions;

// Evita a reinicialização no hot-reload do Next.js
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
