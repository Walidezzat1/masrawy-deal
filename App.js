import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBoQQXMVZNpvTLAWVmVdZnJC21t8GSsirM",
  authDomain: "masrawy-deal-online.firebaseapp.com",
  projectId: "masrawy-deal-online",
  storageBucket: "masrawy-deal-online.firebasestorage.app",
  messagingSenderId: "1038392912272",
  appId: "1:1038392912272:web:e4bc931c46a46840596b15",
  measurementId: "G-50EN819T12"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export default function App() {
  const [status, setStatus] = useState("جاري التشغيل...");

  useEffect(() => {
    signInAnonymously(auth)
      .then(() => setStatus("مصراوي ديل تعمل الآن!"))
      .catch((err) => setStatus("Error: " + err.message));
  }, []);

  return (
    <div style={{display:'flex', justifyContent:'center', alignItems:'center', height:'100vh', background:'#0f172a', color:'white'}}>
      <h1 style={{fontSize:'2rem', fontWeight:'bold'}}>{status}</h1>
    </div>
  );
}