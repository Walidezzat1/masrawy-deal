import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
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
  return (
    <div className="flex items-center justify-center h-screen bg-slate-900 text-white">
      <h1 className="text-4xl font-bold">اللعبة تحت التطوير - جاري التحديث!</h1>
    </div>
  );
}
```eof

### الخطوات الأخيرة لإنهاء العمل:
1. **استبدل** محتوى `src/App.js` بهذا الكود تماماً.
2. احفظ الملف (`Ctrl + S`).
3. افتح **GitHub Desktop**.
4. في المربع الأسفل اكتب `Fixing syntax error` ثم اضغط **Commit to master**.
5. اضغط **Push origin** في الأعلى.
6. اذهب إلى Vercel، وستلاحظ أن عملية البناء (Deployment) بدأت من جديد (باللون الأصفر).

**أخبرني بمجرد أن تصبح الدائرة صفراء، هل يظهر لك أي خطأ جديد؟** إذا نجحت هذه، سنقوم بإضافة باقي كود اللعبة بالتدريج لضمان عدم حدوث الخطأ مرة أخرى.
