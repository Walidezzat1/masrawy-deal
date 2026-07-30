import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot, updateDoc, getDoc } from 'firebase/firestore';
import { Users, Play, Copy, Hand, Wallet, Home } from 'lucide-react';

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

const DECK_TEMPLATE = [
{ id: 'm1_1', type: 'money', value: 1, title: '1 مليون', color: 'bg-yellow-100' },
{ id: 'm1_2', type: 'money', value: 1, title: '1 مليون', color: 'bg-yellow-100' },
{ id: 'm2_1', type: 'money', value: 2, title: '2 مليون', color: 'bg-orange-200' },
{ id: 'm2_2', type: 'money', value: 2, title: '2 مليون', color: 'bg-orange-200' },
{ id: 'm3_1', type: 'money', value: 3, title: '3 مليون', color: 'bg-green-200' },
{ id: 'm4_1', type: 'money', value: 4, title: '4 مليون', color: 'bg-blue-200' },
{ id: 'm5_1', type: 'money', value: 5, title: '5 مليون', color: 'bg-purple-200' },
{ id: 'm10_1', type: 'money', value: 10, title: '10 مليون', color: 'bg-yellow-400' },
{ id: 'p_red_1', type: 'property', colorGroup: 'red', value: 3, title: 'المهندسين', color: 'bg-red-500 text-white' },
{ id: 'p_red_2', type: 'property', colorGroup: 'red', value: 3, title: 'الزمالك', color: 'bg-red-500 text-white' },
{ id: 'p_blue_1', type: 'property', colorGroup: 'blue', value: 4, title: 'مدينتي', color: 'bg-blue-600 text-white' },
{ id: 'p_blue_2', type: 'property', colorGroup: 'blue', value: 4, title: 'الرحاب', color: 'bg-blue-600 text-white' },
{ id: 'p_green_1', type: 'property', colorGroup: 'green', value: 2, title: 'المعادي', color: 'bg-green-600 text-white' },
{ id: 'p_green_2', type: 'property', colorGroup: 'green', value: 2, title: 'مصر الجديدة', color: 'bg-green-600 text-white' },
{ id: 'p_green_3', type: 'property', colorGroup: 'green', value: 2, title: 'مدينة نصر', color: 'bg-green-600 text-white' },
{ id: 'p_brown_1', type: 'property', colorGroup: 'brown', value: 1, title: 'شبرا', color: 'bg-amber-800 text-white' },
{ id: 'p_brown_2', type: 'property', colorGroup: 'brown', value: 1, title: 'وسط البلد', color: 'bg-amber-800 text-white' },
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

useEffect(() => {
const initAuth = async () => {
try {
await signInAnonymously(auth);
} catch (err) {
console.error("Auth Error:", err);
setError("مشكلة في تسجيل الدخول.");
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

useEffect(() => {
if (!user || !roomId) return;
const gameRef = doc(db, 'artifacts', appId, 'public', 'data', 'games', roomId);
const unsubscribe = onSnapshot(gameRef, (docSnap) => {
if (docSnap.exists()) {
const data = docSnap.data();
setGameData(data);
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
setError("حدث خطأ في الاتصال باللعبة.");
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
players: { [user.uid]: { name: playerName, hand: [], board: [], bank: [] } },
playerOrder: [user.uid],
deck: shuffleArray(DECK_TEMPLATE),
discard: [],
currentTurnIndex: 0,
logs: [قام ${playerName} بإنشاء الغرفة.]
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
if (!snap.exists()) return setError("الغرفة غير موجودة.");
const data = snap.data();
if (data.status !== 'waiting') return setError("اللعبة بدأت بالفعل!");
if (!data.players[user.uid]) {
await updateDoc(gameRef, {
[players.${user.uid}]: { name: playerName, hand: [], board: [], bank: [] },
playerOrder: [...data.playerOrder, user.uid],
logs: [...data.logs, انضم ${playerName} إلى الغرفة.]
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
const newLogs = [...gameData.logs, msg].slice(-10);
await updateDoc(gameRef, { logs: newLogs });
};

const isMyTurn = () => {
if (!gameData || gameData.status !== 'playing') return false;
return gameData.playerOrder[gameData.currentTurnIndex] === user.uid;
};

const drawCards = async (count = 2) => {
if (!isMyTurn()) return;
if (hasDrawnThisTurn) return setModalMessage("سحبت كروتك بالفعل!");
let currentDeck = [...gameData.deck];
let newHand = [...gameData.players[user.uid].hand];
let drawn = 0;
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
await updateDoc(gameRef, { deck: currentDeck, discard: gameData.discard, [players.${user.uid}.hand]: newHand });
setHasDrawnThisTurn(true);
addLog(سحب ${gameData.players[user.uid].name} ${drawn} كروت.);
};

const playCard = async (card, destination) => {
if (!isMyTurn()) return;
let newHand = gameData.players[user.uid].hand.filter(c => c.id !== card.id);
let updates = { [players.${user.uid}.hand]: newHand };
let logMsg = "";
if (destination === 'discard') {
updates.discard = [...gameData.discard, card];
logMsg = رمى ${gameData.players[user.uid].name} كارت.;
const gameRef = doc(db, 'artifacts', appId, 'public', 'data', 'games', roomId);
await updateDoc(gameRef, updates);
addLog(logMsg);
return;
}
if (cardsPlayedThisTurn >= 3) return setModalMessage("لعبت 3 كروت! انهِ دورك.");
if (!hasDrawnThisTurn) return setModalMessage("اسحب كروت أولاً!");
if (destination === 'bank') {
updates[players.${user.uid}.bank] = [...gameData.players[user.uid].bank, card];
logMsg = وضع ${gameData.players[user.uid].name} كارت في البنك.;
} else if (destination === 'board') {
updates[players.${user.uid}.board] = [...gameData.players[user.uid].board, card];
logMsg = نزل ${gameData.players[user.uid].name} أرض جديدة.;
} else if (destination === 'action') {
updates.discard = [...gameData.discard, card];
logMsg = استخدم ${gameData.players[user.uid].name} أكشن: ${card.title}.;
if (card.title === 'انطلق') {
let cDeck = [...gameData.deck];
if (cDeck.length >= 2) {
newHand.push(cDeck.shift());
newHand.push(cDeck.shift());
updates.deck = cDeck;
updates[players.${user.uid}.hand] = newHand;
logMsg += " وسحب كارتين.";
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
if (!hasDrawnThisTurn && gameData.players[user.uid].hand.length > 0) return setModalMessage("اسحب كروت أولاً!");
if (gameData.players[user.uid].hand.length > 7) return setModalMessage(معك ${gameData.players[user.uid].hand.length} كروت! ارمِ كروت لتصبح 7.);
const nextIndex = (gameData.currentTurnIndex + 1) % gameData.playerOrder.length;
const gameRef = doc(db, 'artifacts', appId, 'public', 'data', 'games', roomId);
await updateDoc(gameRef, { currentTurnIndex: nextIndex });
setCardsPlayedThisTurn(0);
setHasDrawnThisTurn(false);
addLog(انتهى دور ${gameData.players[user.uid].name}.);
};

const CardUI = ({ card, inHand, onPlay }) => (
<div className={relative w-24 h-36 rounded-lg shadow-md border-2 border-gray-800 flex flex-col items-center justify-between p-2 m-1 cursor-pointer transform transition hover:-translate-y-2 ${card.color}}>
{card.value ? ${card.value}M : ''}
{card.title}
{card.type === 'action' ? card.desc : (card.type === 'property' ? 'أرض' : 'بنك')}
{inHand && isMyTurn() && (

{card.type !== 'property' && <button onClick={() => onPlay(card, 'bank')} className="bg-yellow-500 text-black font-bold text-xs py-1 px-1 mb-1 rounded w-full">للبنك}
{card.type !== 'money' && card.type !== 'action' && <button onClick={() => onPlay(card, 'board')} className="bg-green-500 text-white font-bold text-xs py-1 px-1 mb-1 rounded w-full">للأرض}
{card.type === 'action' && <button onClick={() => onPlay(card, 'action')} className="bg-blue-500 text-white font-bold text-xs py-1 px-1 mb-1 rounded w-full">استخدام}
<button onClick={() => onPlay(card, 'discard')} className="bg-red-700 text-white font-bold text-xs py-1 px-1 mt-auto rounded w-full border border-red-400">رمي

)}

);

if (loading) return جاري التحميل...;

if (!gameData) {
return (


مصراوي ديل
العبها أونلاين مع صحابك
{error && {error}}

<input type="text" value={playerName} onChange={(e) => setPlayerName(e.target.value)} className="w-full bg-slate-700 rounded p-3 text-white" placeholder="اسمك إيه؟" />
إنشاء غرفة جديدة
أو

<input type="text" value={roomId} onChange={(e) => setRoomId(e.target.value)} className="w-full bg-slate-700 rounded p-3 text-white uppercase text-center" placeholder="كود الغرفة" />
انضمام للغرفة




);
}

if (gameData.status === 'waiting') {
return (


غرفة الانتظار


كود الغرفة:
{roomId}

<button onClick={() => { navigator.clipboard.writeText(roomId); setModalMessage("تم النسخ!"); }} className="p-2 bg-slate-600 rounded">


{gameData.playerOrder.map((uid) => (

 {gameData.players[uid].name}
{uid === gameData.host && الهوست}

))}

{gameData.host === user.uid ? (
<button onClick={startGame} className="w-full bg-green-500 text-white font-bold py-3 rounded flex justify-center items-center gap-2" disabled={gameData.playerOrder.length < 2}>
 ابدأ اللعبة!

) : في انتظار الهوست لبدء اللعبة...}


);
}

const opponents = gameData.playerOrder.filter(uid => uid !== user.uid);
const myData = gameData.players[user.uid];
const turnPlayerName = gameData.players[gameData.playerOrder[gameData.currentTurnIndex]].name;

return (


مصراوي ديل
دور: <span className={font-bold px-3 py-1 rounded ${isMyTurn() ? 'bg-yellow-500 text-black' : 'bg-slate-700'}}>{isMyTurn() ? 'دورك أنت!' : turnPlayerName}



{opponents.map(uid => {
const opp = gameData.players[uid];
return (

 {opp.name} {opp.hand.length} كروت باليد
 الأراضي:{opp.board.map((c, i) => <div key={i} className={w-8 h-12 rounded ${c.color} text-[10px] flex items-center justify-center p-1 text-center border border-black/50}>{c.title})}
 البنك:{opp.bank.map((c, i) => <div key={i} className={w-8 h-12 rounded ${c.color} text-black font-bold flex items-center justify-center border border-black/50}>{c.value}M)}

);
})}



DECK{gameData.deck.length} كارت
{gameData.discard.length > 0 ? <CardUI card={gameData.discard[gameData.discard.length - 1]} inHand={false} /> : ساحة اللعب}المرمي ({gameData.discard.length})

{isMyTurn() && (

دورك الآن!
{!hasDrawnThisTurn ? (
<button onClick={() => drawCards(2)} className="bg-blue-600 px-4 py-3 rounded font-bold flex justify-center gap-2 w-full"> اسحب كارتين
) : (
لعبت {cardsPlayedThisTurn} / 3 كروتإنهاء الدور
)}

)}

{[...gameData.logs].reverse().map((log, i) => {log})}




منطقتك

 الأراضي{myData.board.map((card, i) => )}
 البنك{myData.bank.map((card, i) => )}





 كروتك ({myData.hand.length})

{myData.hand.map((card) => )}


{modalMessage && (

{modalMessage}<button onClick={() => setModalMessage('')} className="bg-yellow-500 text-slate-900 font-bold py-2 px-6 rounded">حسناً

)}

);
}