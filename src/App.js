import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot, collection, updateDoc, getDoc } from 'firebase/firestore';
import { Users, Play, Copy, RefreshCw, Hand, Wallet, Home, AlertCircle } from 'lucide-react';

// --- إعدادات Firebase ---
// تم إضافة الكود الخاص بك بنجاح!
const firebaseConfig = {
  apiKey: "AIzaSyBoQQXMVZNpvTLAWVmVdZnJC21t8GSsirM",
  authDomain: "masrawy-deal-online.firebaseapp.com",
  projectId: "masrawy-deal-online",
  storageBucket: "masrawy-deal-online.firebasestorage.app",
  messagingSenderId: "1038392912272",
  appId: "1:1038392912272:web:e4bc931c46a46840596b15",
  measurementId: "G-50EN819T12"
};

const isFirebaseConfigured = !!firebaseConfig.apiKey;
let app, auth, db;

if (isFirebaseConfigured) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
}
const appId = 'masrawy-deal-app';

// --- Card Database (Simplified Masrawy Deal Deck) ---
const DECK_TEMPLATE = [
  // Money
  { id: 'm1_1', type: 'money', value: 1, title: '1 مليون', color: 'bg-yellow-100' },
  { id: 'm1_2', type: 'money', value: 1, title: '1 مليون', color: 'bg-yellow-100' },
  { id: 'm2_1', type: 'money', value: 2, title: '2 مليون', color: 'bg-orange-200' },
  { id: 'm2_2', type: 'money', value: 2, title: '2 مليون', color: 'bg-orange-200' },
  { id: 'm3_1', type: 'money', value: 3, title: '3 مليون', color: 'bg-green-200' },
  { id: 'm4_1', type: 'money', value: 4, title: '4 مليون', color: 'bg-blue-200' },
  { id: 'm5_1', type: 'money', value: 5, title: '5 مليون', color: 'bg-purple-200' },
  { id: 'm10_1', type: 'money', value: 10, title: '10 مليون', color: 'bg-yellow-400' },
  
  // Properties (Egyptianized)
  { id: 'p_red_1', type: 'property', colorGroup: 'red', value: 3, title: 'المهندسين', color: 'bg-red-500 text-white' },
  { id: 'p_red_2', type: 'property', colorGroup: 'red', value: 3, title: 'الزمالك', color: 'bg-red-500 text-white' },
  { id: 'p_blue_1', type: 'property', colorGroup: 'blue', value: 4, title: 'مدينتي', color: 'bg-blue-600 text-white' },
  { id: 'p_blue_2', type: 'property', colorGroup: 'blue', value: 4, title: 'الرحاب', color: 'bg-blue-600 text-white' },
  { id: 'p_green_1', type: 'property', colorGroup: 'green', value: 2, title: 'المعادي', color: 'bg-green-600 text-white' },
  { id: 'p_green_2', type: 'property', colorGroup: 'green', value: 2, title: 'مصر الجديدة', color: 'bg-green-600 text-white' },
  { id: 'p_green_3', type: 'property', colorGroup: 'green', value: 2, title: 'مدينة نصر', color: 'bg-green-600 text-white' },
  { id: 'p_brown_1', type: 'property', colorGroup: 'brown', value: 1, title: 'شبرا', color: 'bg-amber-800 text-white' },
  { id: 'p_brown_2', type: 'property', colorGroup: 'brown', value: 1, title: 'وسط البلد', color: 'bg-amber-800 text-white' },

  // Action Cards
  { id: 'a_pass_1', type: 'action', value: 1, title: 'انطلق', desc: 'اسحب كارتين', color: 'bg-slate-200' },
  { id: 'a_pass_2', type: 'action', value: 1, title: 'انطلق', desc: 'اسحب كارتين', color: 'bg-slate-200' },
  { id: 'a_rent_1', type: 'action', value: 1, title: 'إيجار', desc: 'اطلب إيجار', color: 'bg-slate-200' },
  { id: 'a_steal_1', type: 'action', value: 5, title: 'بلطجة', desc: 'اسرق مجموعة كاملة', color: 'bg-slate-200' },
  { id: 'a_bday_1', type: 'action', value: 2, title: 'عيد ميلادي', desc: 'الكل يدفع 2 مليون', color: 'bg-slate-200' }
];

const shuffleArray = (array) => {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
};

export default function App() {
  const [user, setUser] = useState(null);
  const [playerName, setPlayerName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [gameData, setGameData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [cardsPlayedThisTurn, setCardsPlayedThisTurn] = useState(0);
  const [hasDrawnThisTurn, setHasDrawnThisTurn] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  // Initialize Auth
  useEffect(() => {
    if (!isFirebaseConfigured) {
      setLoading(false);
      return;
    }

    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error("Auth Error:", err);
        setError("مشكلة في تسجيل الدخول. حاول تحديث الصفحة.");
      } finally {
        setLoading(false);
      }
    };
    initAuth();

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Listen to Game Data
  useEffect(() => {
    if (!isFirebaseConfigured || !user || !roomId) return;

    const gameRef = doc(db, 'artifacts', appId, 'public', 'data', 'games', roomId);
    const unsubscribe = onSnapshot(gameRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setGameData(data);
        
        // Reset local turn state if turn changed
        if (data.status === 'playing' && data.playerOrder[data.currentTurnIndex] !== user.uid) {
           setCardsPlayedThisTurn(0);
           setHasDrawnThisTurn(false);
        }
      } else {
        setGameData(null);
        if (roomId) setError("الغرفة غير موجودة!");
      }
    }, (err) => {
      console.error("Snapshot Error:", err);
      setError("حدث خطأ أثناء الاتصال باللعبة.");
    });

    return () => unsubscribe();
  }, [user, roomId]);

  const generateRoomId = () => Math.random().toString(36).substring(2, 8).toUpperCase();

  const createGame = async () => {
    if (!playerName.trim()) return setError("اكتب اسمك الأول!");
    if (!user) return setError("جاري تسجيل الدخول...");

    const newRoomId = generateRoomId();
    const gameRef = doc(db, 'artifacts', appId, 'public', 'data', 'games', newRoomId);
    
    const initialGame = {
      host: user.uid,
      status: 'waiting',
      players: {
        [user.uid]: { name: playerName, hand: [], board: [], bank: [] }
      },
      playerOrder: [user.uid],
      deck: shuffleArray(DECK_TEMPLATE),
      discard: [],
      currentTurnIndex: 0,
      logs: [`قام ${playerName} بإنشاء الغرفة.`]
    };

    try {
      await setDoc(gameRef, initialGame);
      setRoomId(newRoomId);
      setError('');
    } catch (err) {
      console.error(err);
      setError("فشل إنشاء الغرفة.");
    }
  };

  const joinGame = async (e) => {
    e.preventDefault();
    if (!playerName.trim()) return setError("اكتب اسمك الأول!");
    if (!roomId.trim()) return setError("اكتب كود الغرفة!");
    if (!user) return setError("جاري تسجيل الدخول...");

    const roomUpper = roomId.toUpperCase();
    const gameRef = doc(db, 'artifacts', appId, 'public', 'data', 'games', roomUpper);
    
    try {
      const snap = await getDoc(gameRef);
      if (!snap.exists()) {
        return setError("هذه الغرفة غير موجودة.");
      }

      const data = snap.data();
      if (data.status !== 'waiting') {
        return setError("اللعبة بدأت بالفعل!");
      }

      if (!data.players[user.uid]) {
        await updateDoc(gameRef, {
          [`players.${user.uid}`]: { name: playerName, hand: [], board: [], bank: [] },
          playerOrder: [...data.playerOrder, user.uid],
          logs: [...data.logs, `انضم ${playerName} إلى الغرفة.`]
        });
      }
      setRoomId(roomUpper);
      setError('');
    } catch (err) {
      console.error(err);
      setError("فشل الانضمام للغرفة.");
    }
  };

  const startGame = async () => {
    if (!gameData || gameData.host !== user.uid) return;
    
    let currentDeck = [...gameData.deck];
    let newPlayers = { ...gameData.players };

    // Deal 5 cards to each player
    gameData.playerOrder.forEach(uid => {
      const hand = currentDeck.splice(0, 5);
      newPlayers[uid].hand = hand;
    });

    const gameRef = doc(db, 'artifacts', appId, 'public', 'data', 'games', roomId);
    await updateDoc(gameRef, {
      status: 'playing',
      deck: currentDeck,
      players: newPlayers,
      logs: [...gameData.logs, "بدأت اللعبة! تم توزيع الكروت."]
    });
    setCardsPlayedThisTurn(0);
    setHasDrawnThisTurn(false);
  };

  const addLog = async (msg) => {
    const gameRef = doc(db, 'artifacts', appId, 'public', 'data', 'games', roomId);
    const newLogs = [...gameData.logs, msg].slice(-10); // keep last 10 logs
    await updateDoc(gameRef, { logs: newLogs });
  };

  const isMyTurn = () => {
    if (!gameData || gameData.status !== 'playing') return false;
    return gameData.playerOrder[gameData.currentTurnIndex] === user.uid;
  };

  const drawCards = async (count = 2) => {
    if (!isMyTurn()) return;
    if (hasDrawnThisTurn) {
        setModalMessage("لقد سحبت كروتك في هذا الدور بالفعل!");
        return;
    }
    
    let currentDeck = [...gameData.deck];
    let newHand = [...gameData.players[user.uid].hand];
    let drawn = 0;

    // Reshuffle discard if deck is empty
    if (currentDeck.length < count && gameData.discard.length > 0) {
       currentDeck = [...currentDeck, ...shuffleArray(gameData.discard)];
       gameData.discard = [];
       addLog("تم إعادة خلط الكروت الملعوبة.");
    }

    for (let i = 0; i < count; i++) {
      if (currentDeck.length > 0) {
        newHand.push(currentDeck.shift());
        drawn++;
      }
    }

    const gameRef = doc(db, 'artifacts', appId, 'public', 'data', 'games', roomId);
    await updateDoc(gameRef, {
      deck: currentDeck,
      discard: gameData.discard,
      [`players.${user.uid}.hand`]: newHand
    });
    setHasDrawnThisTurn(true);
    addLog(`سحب ${gameData.players[user.uid].name} ${drawn} كروت.`);
  };

  const playCard = async (card, destination) => {
    if (!isMyTurn()) return;

    let newHand = gameData.players[user.uid].hand.filter(c => c.id !== card.id);
    let updates = {
      [`players.${user.uid}.hand`]: newHand
    };
    let logMsg = "";

    // If destination is discard, it DOES NOT count as a played card (used to reduce hand to 7)
    if (destination === 'discard') {
        updates.discard = [...gameData.discard, card];
        logMsg = `رمى ${gameData.players[user.uid].name} كارت للتخلص منه.`;
        
        const gameRef = doc(db, 'artifacts', appId, 'public', 'data', 'games', roomId);
        await updateDoc(gameRef, updates);
        addLog(logMsg);
        return; // Exit here so cardsPlayedThisTurn is NOT incremented
    }

    // Normal Play Logic (Counts as one of the 3 actions)
    if (cardsPlayedThisTurn >= 3) {
       setModalMessage("لقد قمت بلعب 3 كروت بالفعل! انهِ دورك أو ارمِ كروت إذا كان معك أكثر من 7.");
       return;
    }

    if (!hasDrawnThisTurn) {
        setModalMessage("يجب أن تسحب كروت أولاً قبل اللعب!");
        return;
    }

    if (destination === 'bank') {
      updates[`players.${user.uid}.bank`] = [...gameData.players[user.uid].bank, card];
      logMsg = `وضع ${gameData.players[user.uid].name} كارت في البنك.`;
    } else if (destination === 'board') {
      updates[`players.${user.uid}.board`] = [...gameData.players[user.uid].board, card];
      logMsg = `نزل ${gameData.players[user.uid].name} أرض جديدة.`;
    } else if (destination === 'action') {
      updates.discard = [...gameData.discard, card];
      logMsg = `استخدم ${gameData.players[user.uid].name} أكشن: ${card.title}.`;
      
      // Auto-handle simple actions
      if (card.title === 'انطلق') {
        let cDeck = [...gameData.deck];
        if (cDeck.length >= 2) {
            newHand.push(cDeck.shift());
            newHand.push(cDeck.shift());
            updates.deck = cDeck;
            updates[`players.${user.uid}.hand`] = newHand;
            logMsg += " وسحب كارتين إضافيين.";
        }
      }
    }

    const gameRef = doc(db, 'artifacts', appId, 'public', 'data', 'games', roomId);
    await updateDoc(gameRef, updates);
    addLog(logMsg);
    setCardsPlayedThisTurn(prev => prev + 1);
  };

  const endTurn = async () => {
    if (!isMyTurn()) return;
    
    if (!hasDrawnThisTurn && gameData.players[user.uid].hand.length > 0) {
        setModalMessage("يجب أن تسحب كروتك في بداية الدور!");
        return;
    }

    if (gameData.players[user.uid].hand.length > 7) {
        setModalMessage(`يجب أن يكون في يدك 7 كروت كحد أقصى لإنهاء الدور. (معك الآن ${gameData.players[user.uid].hand.length} كروت). استخدم زر "رمي" للتخلص من الكروت الزائدة.`);
        return;
    }

    const nextIndex = (gameData.currentTurnIndex + 1) % gameData.playerOrder.length;
    const gameRef = doc(db, 'artifacts', appId, 'public', 'data', 'games', roomId);
    await updateDoc(gameRef, {
      currentTurnIndex: nextIndex
    });
    
    setCardsPlayedThisTurn(0);
    setHasDrawnThisTurn(false);
    addLog(`انتهى دور ${gameData.players[user.uid].name}.`);
  };

  // --- UI Components ---
  const CardUI = ({ card, inHand, onPlay }) => {
    return (
      <div className={`relative w-24 h-36 rounded-lg shadow-md border-2 border-gray-800 flex flex-col items-center justify-between p-2 m-1 cursor-pointer transform transition hover:-translate-y-2 ${card.color}`}>
        <div className="w-full text-left font-bold text-sm">
           {card.value ? `${card.value}M` : ''}
        </div>
        <div className="text-center font-bold text-sm">
          {card.title}
        </div>
        <div className="text-xs text-center opacity-80">
          {card.type === 'action' ? card.desc : (card.type === 'property' ? 'أرض' : 'بنك')}
        </div>
        
        {/* Play Menu Overlay (only for hand) */}
        {inHand && isMyTurn() && (
          <div className="absolute inset-0 bg-black bg-opacity-90 rounded-lg flex flex-col justify-center items-center opacity-0 hover:opacity-100 transition-opacity p-1">
            {card.type !== 'property' && (
              <button onClick={() => onPlay(card, 'bank')} className="bg-yellow-500 text-black font-bold text-xs py-1 px-1 mb-1 rounded w-full">للبنك</button>
            )}
            {card.type !== 'money' && card.type !== 'action' && (
              <button onClick={() => onPlay(card, 'board')} className="bg-green-500 text-white font-bold text-xs py-1 px-1 mb-1 rounded w-full">للأرض</button>
            )}
            {card.type === 'action' && (
              <button onClick={() => onPlay(card, 'action')} className="bg-blue-500 text-white font-bold text-xs py-1 px-1 mb-1 rounded w-full">استخدام</button>
            )}
            {/* The Discard Button - Doesn't count as an action */}
            <button onClick={() => onPlay(card, 'discard')} className="bg-red-700 text-white font-bold text-xs py-1 px-1 mt-auto rounded w-full border border-red-400">رمي</button>
          </div>
        )}
      </div>
    );
  };

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    setModalMessage("تم نسخ كود الغرفة!");
  };

  if (!isFirebaseConfigured) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-slate-900 text-white p-4 text-center" dir="rtl">
         <AlertCircle size={64} className="text-yellow-500 mb-4" />
         <h1 className="text-2xl font-bold mb-2">في انتظار إعدادات Firebase!</h1>
         <p className="text-slate-400 max-w-md leading-relaxed">
           لقد حدث الخطأ <code>(auth/invalid-api-key)</code> لأن اللعبة حاولت الاتصال بقاعدة البيانات بدون وجود مفاتيح الاتصال.
           <br/><br/>
           لكي تعمل اللعبة وتختفي هذه الرسالة، يرجى استبدال كود <code>firebaseConfig</code> الموجود في أعلى الملف بالكود الحقيقي الذي حصلت عليه من موقع Firebase.
         </p>
      </div>
    );
  }

  if (loading) {
    return <div className="flex justify-center items-center h-screen text-xl" dir="rtl">جاري التحميل...</div>;
  }

  // Lobby Screen
  if (!gameData) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4" dir="rtl">
        <div className="max-w-md w-full bg-slate-800 rounded-xl shadow-2xl p-8 border border-slate-700">
          <h1 className="text-4xl font-black text-center mb-2 text-yellow-400 tracking-wider">مصراوي ديل</h1>
          <p className="text-center text-slate-400 mb-1">العبها أونلاين مع صحابك</p>
          <p className="text-center text-yellow-600 font-bold mb-8 text-sm">إعداد أ/ وليد عزت</p>

          {error && <div className="bg-red-500/20 border border-red-500 text-red-300 p-3 rounded mb-4 text-sm">{error}</div>}

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">اسمك إيه؟</label>
              <input 
                type="text" 
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="w-full bg-slate-700 border-none rounded p-3 text-white focus:ring-2 focus:ring-yellow-400"
                placeholder="مثال: أحمد"
              />
            </div>

            <button 
              onClick={createGame}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-bold py-3 rounded transition"
            >
              إنشاء غرفة جديدة
            </button>

            <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-slate-600"></div>
                <span className="flex-shrink-0 mx-4 text-slate-500">أو</span>
                <div className="flex-grow border-t border-slate-600"></div>
            </div>

            <form onSubmit={joinGame} className="space-y-3">
              <input 
                type="text" 
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                className="w-full bg-slate-700 border-none rounded p-3 text-white focus:ring-2 focus:ring-blue-400 uppercase text-center tracking-widest font-mono"
                placeholder="كود الغرفة"
              />
              <button 
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded transition"
              >
                انضمام للغرفة
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Waiting Room
  if (gameData.status === 'waiting') {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4" dir="rtl">
        <div className="max-w-md w-full bg-slate-800 rounded-xl shadow-2xl p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">غرفة الانتظار</h2>
          
          <div className="bg-slate-700 rounded-lg p-4 mb-6 flex justify-between items-center">
            <div>
              <p className="text-sm text-slate-400">كود الغرفة:</p>
              <p className="text-3xl font-mono tracking-widest font-bold text-yellow-400">{roomId}</p>
            </div>
            <button onClick={copyRoomId} className="p-2 bg-slate-600 rounded hover:bg-slate-500 transition">
              <Copy size={20} />
            </button>
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-3 border-b border-slate-700 pb-2 text-right">اللاعبين ({gameData.playerOrder.length}):</h3>
            <ul className="space-y-2 text-right">
              {gameData.playerOrder.map((uid) => (
                <li key={uid} className="flex items-center space-x-2 space-x-reverse bg-slate-700 p-2 rounded">
                  <Users size={16} className="text-blue-400" />
                  <span>{gameData.players[uid].name}</span>
                  {uid === gameData.host && <span className="text-xs bg-yellow-500 text-slate-900 px-2 py-1 rounded ml-auto">الهوست</span>}
                </li>
              ))}
            </ul>
          </div>

          {gameData.host === user.uid ? (
            <button 
              onClick={startGame}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded flex items-center justify-center gap-2 transition"
              disabled={gameData.playerOrder.length < 2}
            >
              <Play size={20} />
              {gameData.playerOrder.length < 2 ? 'في انتظار لاعبين آخرين...' : 'ابدأ اللعبة!'}
            </button>
          ) : (
            <p className="text-slate-400 animate-pulse">في انتظار الهوست لبدء اللعبة...</p>
          )}
        </div>

        {/* Modal Overlay */}
        {modalMessage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <div className="bg-slate-800 border border-slate-600 p-6 rounded-xl shadow-2xl max-w-sm w-full text-center">
              <p className="text-lg mb-6 text-white">{modalMessage}</p>
              <button 
                onClick={() => setModalMessage('')} 
                className="bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-bold py-2 px-6 rounded transition"
              >
                حسناً
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- Main Game Board ---
  const opponents = gameData.playerOrder.filter(uid => uid !== user.uid);
  const myData = gameData.players[user.uid];
  const turnPlayerName = gameData.players[gameData.playerOrder[gameData.currentTurnIndex]].name;

  return (
    <div className="min-h-screen bg-green-900 text-white flex flex-col" dir="rtl">
      
      {/* Top Bar */}
      <header className="bg-slate-900 p-3 flex justify-between items-center shadow-md shrink-0">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-xl font-bold text-yellow-400 leading-none mb-1">مصراوي ديل</h1>
            <p className="text-[10px] text-slate-400 leading-none">إعداد أ/ وليد عزت</p>
          </div>
          <span className="bg-slate-700 px-3 py-1 rounded text-sm font-mono tracking-widest">{roomId}</span>
        </div>
        <div className="text-sm flex items-center gap-2">
          دور: <span className={`font-bold px-3 py-1 rounded ${isMyTurn() ? 'bg-yellow-500 text-black animate-pulse' : 'bg-slate-700'}`}>
            {isMyTurn() ? 'دورك أنت!' : turnPlayerName}
          </span>
        </div>
      </header>

      {/* Game Area */}
      <div className="flex-1 overflow-hidden flex flex-col md:flex-row p-2 gap-2">
        
        {/* Left/Top: Opponents */}
        <div className="md:w-1/3 flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-y-auto pb-2">
          {opponents.map(uid => {
            const opp = gameData.players[uid];
            return (
              <div key={uid} className="bg-black/40 rounded-lg p-3 min-w-[250px] shrink-0 border border-green-800">
                <h3 className="font-bold mb-2 flex items-center gap-2 text-blue-200">
                  <Users size={16}/> {opp.name} 
                  <span className="text-xs bg-slate-700 text-white px-2 py-1 rounded ml-auto">{opp.hand.length} كروت باليد</span>
                </h3>
                
                <div className="mb-2 bg-black/20 p-2 rounded">
                  <div className="text-xs text-slate-400 mb-1 flex items-center gap-1"><Home size={12}/> الأراضي:</div>
                  <div className="flex flex-wrap gap-1">
                    {opp.board.length === 0 ? <span className="text-xs text-slate-500">لا يوجد</span> : 
                      opp.board.map((c, i) => <div key={i} className={`w-8 h-12 rounded ${c.color} text-[10px] flex items-center justify-center p-1 text-center leading-tight shadow border border-black/50`}>{c.title}</div>)
                    }
                  </div>
                </div>

                <div className="bg-black/20 p-2 rounded">
                  <div className="text-xs text-slate-400 mb-1 flex items-center gap-1"><Wallet size={12}/> البنك:</div>
                  <div className="flex flex-wrap gap-1">
                    {opp.bank.length === 0 ? <span className="text-xs text-slate-500">لا يوجد</span> : 
                      opp.bank.map((c, i) => <div key={i} className={`w-8 h-12 rounded ${c.color} text-black font-bold flex items-center justify-center shadow border border-black/50`}>{c.value}M</div>)
                    }
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Center: Table (Deck & Discard & Logs) */}
        <div className="md:w-1/3 bg-green-800/50 rounded-lg p-4 flex flex-col items-center justify-center border-2 border-dashed border-green-700 relative">
          
          <div className="flex gap-8 mb-6">
             {/* Deck */}
             <div className="flex flex-col items-center">
               <div className="w-24 h-36 bg-slate-800 rounded-lg border-4 border-slate-600 flex items-center justify-center shadow-xl shadow-black/50 relative">
                  <div className="absolute inset-2 border-2 border-slate-500 rounded border-dashed opacity-50"></div>
                  <span className="font-bold text-yellow-500 transform -rotate-45 text-xl tracking-widest opacity-30">DECK</span>
               </div>
               <span className="text-sm mt-2 font-mono text-slate-300">{gameData.deck.length} كارت</span>
             </div>

             {/* Discard */}
             <div className="flex flex-col items-center">
               <div className="w-24 h-36 bg-slate-700/50 rounded-lg border-2 border-slate-600 flex items-center justify-center relative">
                  {gameData.discard.length > 0 ? (
                    <CardUI card={gameData.discard[gameData.discard.length - 1]} inHand={false} />
                  ) : (
                    <span className="text-sm text-slate-400">ساحة اللعب</span>
                  )}
               </div>
               <span className="text-sm mt-2 text-slate-300">المرمي ({gameData.discard.length})</span>
             </div>
          </div>

          {/* Action Area */}
          {isMyTurn() && (
            <div className="bg-black/60 p-4 rounded-xl text-center w-full max-w-sm border border-yellow-500/50 shadow-lg">
              <p className="mb-3 font-bold text-yellow-400">دورك الآن!</p>
              
              {!hasDrawnThisTurn ? (
                <button onClick={() => drawCards(2)} className="bg-blue-600 hover:bg-blue-500 px-4 py-3 rounded font-bold shadow-lg flex items-center justify-center gap-2 w-full animate-bounce">
                  <Hand size={18} /> اسحب كارتين للبدء
                </button>
              ) : (
                <>
                  <p className="text-sm text-slate-300 mb-3">لعبت <span className="font-bold text-white">{cardsPlayedThisTurn} / 3</span> كروت هذا الدور</p>
                  <button 
                    onClick={endTurn} 
                    className="bg-red-600 hover:bg-red-500 px-6 py-2 rounded font-bold w-full shadow-lg"
                  >
                    إنهاء الدور
                  </button>
                </>
              )}
            </div>
          )}

          {/* Activity Log */}
          <div className="absolute bottom-2 left-2 right-2 bg-black/80 p-2 rounded h-24 overflow-y-auto text-xs text-slate-300 border border-slate-700 flex flex-col-reverse">
            {[...gameData.logs].reverse().map((log, i) => (
              <div key={i} className="mb-1 border-b border-slate-700/50 pb-1">{log}</div>
            ))}
          </div>

        </div>

        {/* Right/Bottom: My Area */}
        <div className="md:w-1/3 flex flex-col gap-2">
          
          {/* My Board & Bank */}
          <div className="bg-black/30 rounded-lg p-3 flex-1 border border-green-800 flex flex-col">
            <h3 className="font-bold mb-2 text-yellow-400">منطقتك</h3>
            
            <div className="flex-1 flex flex-col gap-2">
              <div className="bg-black/40 p-2 rounded flex-1 border border-green-800/50">
                <div className="text-sm text-slate-400 mb-2 border-b border-green-800/50 pb-1 flex items-center gap-2"><Home size={14}/> الأراضي (مجموعاتك)</div>
                <div className="flex flex-wrap gap-2">
                  {myData.board.length === 0 ? <span className="text-sm text-slate-500 italic p-2">لم تنزل أراضي بعد...</span> : 
                    myData.board.map((card, i) => <CardUI key={i} card={card} inHand={false} />)
                  }
                </div>
              </div>

              <div className="bg-black/40 p-2 rounded min-h-[120px] border border-green-800/50">
                <div className="text-sm text-slate-400 mb-2 border-b border-green-800/50 pb-1 flex items-center gap-2"><Wallet size={14}/> البنك (رصيدك)</div>
                <div className="flex flex-wrap gap-2">
                  {myData.bank.length === 0 ? <span className="text-sm text-slate-500 italic p-2">رصيدك صفر...</span> : 
                    myData.bank.map((card, i) => <CardUI key={i} card={card} inHand={false} />)
                  }
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Hand (Fixed Bottom) */}
      <div className="bg-slate-900 p-4 shrink-0 shadow-[0_-10px_30px_rgba(0,0,0,0.5)] z-10 border-t border-slate-700">
        <h3 className="text-sm text-slate-400 mb-2 flex items-center gap-2">
          <Hand size={16} /> كروتك ({myData.hand.length}) 
          {isMyTurn() && <span className="text-yellow-400 text-xs ml-auto">اضغط على الكارت للعب أو الرمي</span>}
          {myData.hand.length > 7 && <span className="text-red-400 text-xs font-bold bg-red-900/50 px-2 py-1 rounded">معك أكثر من 7 كروت! استخدم زر "رمي" للتخلص منها.</span>}
        </h3>
        <div className="flex overflow-x-auto pb-2 gap-2 snap-x">
          {myData.hand.map((card) => (
            <div key={card.id} className="snap-center">
              <CardUI card={card} inHand={true} onPlay={playCard} />
            </div>
          ))}
          {myData.hand.length === 0 && (
            <div className="w-full text-center text-slate-500 py-8 border-2 border-dashed border-slate-700 rounded-lg">
              إيدك فاضية! {isMyTurn() ? 'اسحب كروت من الدك.' : 'انتظر دورك.'}
            </div>
          )}
        </div>
      </div>

      {/* Modal Overlay */}
      {modalMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-slate-800 border border-slate-600 p-6 rounded-xl shadow-2xl max-w-sm w-full text-center">
            <p className="text-lg mb-6 text-white">{modalMessage}</p>
            <button 
              onClick={() => setModalMessage('')} 
              className="bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-bold py-2 px-6 rounded transition"
            >
              حسناً
            </button>
          </div>
        </div>
      )}

    </div>
  );
}