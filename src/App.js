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
  const [status, setStatus] = useState("جاري تشغيل اللعبة...");

  useEffect(() => {
    signInAnonymously(auth)
      .then(() => {
        setStatus("مصراوي ديل تعمل الآن بنجاح!");
      })
      .catch((err) => {
        setStatus("خطأ في الاتصال: " + err.message);
      });
  }, []);

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#0f172a', 
      color: 'white', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      textAlign: 'center',
      padding: '20px'
    }}>
      <h1 style={{ fontSize: '3rem', fontWeight: 'bold', color: '#fbbf24', marginBottom: '1rem' }}>
        مصراوي ديل
      </h1>
      <p style={{ fontSize: '1.2rem', marginBottom: '20px' }}>{status}</p>
      <div style={{ marginTop: '20px', padding: '20px', background: '#1e293b', borderRadius: '8px' }}>
        إعداد أ/ وليد عزت
      </div>
    </div>
  );
}
