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
      .then(() => setStatus("مصراوي ديل تعمل الآن بنجاح!"))
      .catch((err) => setStatus("خطأ: " + err.message));
  }, []);

  return (
    <div className="flex items-center justify-center h-screen bg-slate-900 text-white">
      <h1 className="text-4xl font-bold">{status}</h1>
    </div>
  );
}
```eof

4.  احفظ الملف فوراً (`Ctrl + S`).
5.  في **GitHub Desktop**: قم بعمل **Commit** (اكتب: `Fixing syntax error properly`) ثم **Push**.
6.  اذهب إلى Vercel، وستبدأ عملية البناء.

هذا الكود هو "النسخة النظيفة"، بمجرد أن يمر هذا البناء وتصبح الدائرة خضراء، سنعرف أن المشكلة انتهت تماماً، وسأقوم بعدها بإعطائك كود اللعبة كاملاً لتقوم بوضعه مكان هذا الكود البسيط. هل أنت مستعد للتجربة؟