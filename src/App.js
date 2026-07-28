import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot, updateDoc, getDoc } from 'firebase/firestore';
import { Users, Play, Copy, Hand, Wallet, Home, AlertCircle } from 'lucide-react';

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
const appId = 'masrawy-deal-app';

export default function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        await signInAnonymously(auth);
      } catch (err) {
        console.error("Auth Error:", err);
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-screen bg-slate-900 text-white">جاري تحميل اللعبة...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4" dir="rtl">
      <h1 className="text-4xl font-black text-yellow-400 mb-4">مصراوي ديل</h1>
      <p className="text-slate-400">إعداد أ/ وليد عزت</p>
      <div className="mt-8 p-6 bg-slate-800 rounded-lg border border-slate-700">
        <p>النسخة الكاملة تعمل الآن بنجاح!</p>
      </div>
    </div>
  );
}
