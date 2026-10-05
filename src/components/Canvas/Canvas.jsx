import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Users, Clock, Trophy, Send, Palette, Eraser, RotateCcw, CheckCircle, XCircle } from 'lucide-react';
import { db } from '../../firebase';
import { ref, onValue, push, set, update, get, runTransaction } from 'firebase/database';
import styles from './Canvas.module.css';
import WordChoice from '../WordChoice/WordChoice';
import WaitingForWord from '../WaitingForWord/WaitingForWord';

const WORDS = [
  // Nature & space
  'THUNDER', 'HAILSTONE', 'LOG', 'STUMP', 'SEASHELL', 'PEBBLE', 'CRATER', 'SATELLITE', 'ECLIPSE',
  'ASTEROID', 'UFO', 'SHOOTING STAR', 'CRESCENT', 'SPACE STATION', 'SOLAR SYSTEM', 'ICEBERG', 'OASIS',

  // Animals
  'GOOSE', 'TURKEY', 'DONKEY', 'BUFFALO', 'OX', 'LLAMA', 'MOOSE', 'OTTER', 'BEAVER', 'RACCOON',
  'SKUNK', 'GORILLA', 'CHEETAH', 'LEOPARD', 'PORCUPINE', 'SLOTH', 'WALRUS', 'POLAR BEAR', 'STINGRAY',
  'EEL', 'LOBSTER', 'SHRIMP', 'GRASSHOPPER', 'WASP', 'MOTH', 'FIREFLY', 'TOAD', 'CHAMELEON',
  'TOUCAN', 'PELICAN', 'STORK', 'SPARROW', 'HUMMINGBIRD', 'BEEHIVE', 'BIRDCAGE', 'DOGHOUSE', 'AQUARIUM',

  // Household & tools
  'STOVE', 'MICROWAVE', 'WASHING MACHINE', 'IRON', 'HANGER', 'SHELF', 'BOOKSHELF', 'CARPET',
  'DOORBELL', 'MAILBOX', 'TRASH CAN', 'VASE', 'PICTURE FRAME', 'CHANDELIER', 'HAMMOCK', 'CRADLE',
  'SPONGE', 'MOP', 'SHOVEL', 'RAKE', 'WHEELBARROW', 'WATERING CAN', 'HOSE', 'DRILL', 'WRENCH',
  'PLIERS', 'STAPLER', 'PAPER CLIP', 'BASKET', 'JAR', 'MUG', 'TEAPOT', 'CHOPSTICKS', 'LADLE',
  'WHISK', 'ROLLING PIN', 'BLENDER', 'SUITCASE', 'SLEEPING BAG', 'FLASHLIGHT', 'CHIMNEY SMOKE',

  // Food & drink
  'PEANUT', 'WALNUT', 'SUSHI', 'DUMPLING', 'BAGEL', 'CROISSANT', 'MUFFIN', 'PIE', 'OMELETTE',
  'SAUSAGE', 'BACON', 'STEAK', 'DRUMSTICK', 'CORN COB', 'BEETROOT', 'LETTUCE', 'GINGER', 'WATER',
  'SODA', 'CANDY CANE', 'GINGERBREAD MAN', 'DOSA', 'IDLI', 'LADDU', 'BIRYANI', 'JELLY', 'SUNDAE',

  // Transport & construction
  'MOTORCYCLE', 'BICYCLE', 'FIRE TRUCK', 'POLICE CAR', 'SCHOOL BUS', 'TRAM', 'SUBWAY', 'CRANE',
  'BULLDOZER', 'EXCAVATOR', 'FERRY', 'RAFT', 'SAILBOAT', 'YACHT', 'JET', 'GLIDER', 'ESCALATOR',
  'ELEVATOR', 'WHEELCHAIR', 'STROLLER', 'ROAD SIGN', 'TUNNEL', 'SKYSCRAPER', 'CONSTRUCTION SITE',

  // Clothing & accessories
  'SUNGLASSES', 'BOW TIE', 'BELT', 'SARI', 'TURBAN', 'BANDANA', 'RAINCOAT', 'PAJAMAS', 'SWIMSUIT',
  'BUTTON', 'ZIPPER', 'EARRINGS', 'BRACELET', 'HANDBAG', 'TOP HAT', 'WIG', 'LIPSTICK',

  // Sports, toys & fun
  'VOLLEYBALL', 'GOLF', 'BASEBALL', 'HOCKEY', 'BOXING', 'ARCHERY', 'SURFING', 'DIVING', 'ROWING',
  'WRESTLING', 'YOGA', 'TREADMILL', 'DUMBBELL', 'JIGSAW', 'RATTLE', 'BUBBLES', 'PINATA',
  'FERRIS WHEEL', 'ROLLER COASTER', 'MERRY-GO-ROUND', 'SANDCASTLE', 'SNOWBALL', 'DOMINO', 'MARBLES',
  'PUPPET', 'SNOWBOARD', 'DARTBOARD', 'TARGET', 'HOURGLASS',

  // Music
  'XYLOPHONE', 'HARP', 'ACCORDION', 'SAXOPHONE', 'TAMBOURINE', 'TABLA', 'SITAR', 'MUSIC NOTE',

  // Jobs & people
  'PILOT', 'FIREFIGHTER', 'POLICEMAN', 'BAKER', 'PAINTER', 'ARTIST', 'DANCER', 'SINGER',
  'MAGICIAN', 'SOLDIER', 'DETECTIVE', 'JUDGE', 'SAILOR', 'FISHERMAN', 'CARPENTER', 'PLUMBER',
  'BARBER', 'POSTMAN', 'GIANT', 'GENIE', 'WITCH', 'VAMPIRE', 'ZOMBIE', 'MUMMY',

  // Tech
  'WIFI', 'EMAIL', 'TABLET', 'PRINTER', 'DRONE', 'JOYSTICK', 'SMARTWATCH', 'CHARGER',
  'SOLAR PANEL', 'ANTENNA', 'SATELLITE DISH', 'MOBILE TOWER', 'SMARTPHONE',

  // Fantasy & adventure
  'BROOMSTICK', 'CAULDRON', 'TRIDENT', 'CATAPULT', 'CANNON', 'ARMOR', 'THRONE', 'DRAWBRIDGE',
  'TOTEM', 'BOMB', 'TOMBSTONE', 'TREASURE CHEST', 'PIRATE SHIP', 'SPACE SUIT',

  // Symbols
  'QUESTION MARK', 'THUMBS UP', 'PEACE SIGN', 'FOOTPRINT', 'FINGERPRINT', 'LIGHTNING BOLT',
  'CROSS', 'INFINITY', 'SPEECH BUBBLE', 'EXCLAMATION MARK',

  // Actions
  'JUGGLING', 'SHOPPING', 'DIGGING', 'SWEEPING', 'KNITTING', 'SKIPPING', 'PUSHING', 'PULLING',
  'HUGGING', 'WHISPERING', 'SHOUTING', 'THINKING', 'WINKING', 'CHEWING', 'FALLING', 'LIFTING',
  'CARRYING', 'SLEEPWALKING', 'HICCUPS',

  // Places & landmarks
  'BAKERY', 'PHARMACY', 'SALON', 'GYM', 'STADIUM', 'THEATER', 'FACTORY', 'MINE', 'WELL',
  'OBSERVATORY', 'TAJ MAHAL', 'EIFFEL TOWER', 'STATUE OF LIBERTY', 'GREAT WALL', 'LEANING TOWER'
];

const normalizeAnswer = (val) => val.trim().toLowerCase();

const getThreeWords = (usedWordsSet) => {
  const available = WORDS.filter(w => !usedWordsSet.has(w));
  const pool = available.length >= 3 ? available : WORDS;
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3);
};

const DrawingGame = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const getSavedState = () => {
    try { return JSON.parse(localStorage.getItem('drawingGameState')); } catch (e) { return null; }
  };
  const rawState = location.state?.roomCode ? location.state : getSavedState();
  const gameSettings = rawState?.gameSettings;
  const roomCode = rawState?.roomCode;
  const currentPlayerData = rawState?.currentPlayer;

  const [players, setPlayers] = useState(
    (rawState?.players || []).slice().sort((a, b) => (a.joinedAt || 0) - (b.joinedAt || 0))
  );
  const [roundStatus, setRoundStatus] = useState('choosing_word'); // choosing_word | drawing | round_finished
  const [currentDrawerIndex, setCurrentDrawerIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [round, setRound] = useState(1);
  const [totalRounds, setTotalRounds] = useState(3);
  const [currentWord, setCurrentWord] = useState('');
  const [wordOptions, setWordOptions] = useState([]);
  const [guessInput, setGuessInput] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [roundEnded, setRoundEnded] = useState(false);
  const [revealedLetters, setRevealedLetters] = useState({});
  const [inputFocused, setInputFocused] = useState(false);
  const [playersExpanded, setPlayersExpanded] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [alreadyGuessedCorrectly, setAlreadyGuessedCorrectly] = useState(false);
  const [myCorrectPoints, setMyCorrectPoints] = useState(0);

  const roundEndedRef = useRef(false);
  const playersRef2 = useRef(players);
  const totalRoundsRef = useRef(3);
  const lastRoundStartTimeRef = useRef(0);
  const isDrawingRef = useRef(false);
  const guessListRef = useRef(null);

  const currentPlayer = currentPlayerData || (players.length > 0 ? players[0] : null);
  const currentDrawer = players[currentDrawerIndex];
  const currentDrawerId = currentDrawer?.id;
  const currentDrawerName = currentDrawer?.name;
  const isCurrentPlayerDrawing = currentPlayer && (
    (currentDrawerId && currentPlayer.id === currentDrawerId) ||
    (currentDrawerName && currentPlayer.name === currentDrawerName)
  );

  useEffect(() => { playersRef2.current = players; }, [players]);
  useEffect(() => { roundEndedRef.current = roundEnded; }, [roundEnded]);

  // Persist state to localStorage
  useEffect(() => {
    if (location.state?.roomCode) {
      localStorage.setItem('drawingGameState', JSON.stringify({
        roomCode: location.state.roomCode,
        currentPlayer: location.state.currentPlayer,
        players: location.state.players,
        gameSettings: location.state.gameSettings
      }));
    }
  }, [location.state?.roomCode, location.state?.currentPlayer, location.state?.players, location.state?.gameSettings]);

  // Visual viewport handler for mobile keyboard
  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;
    const handleResize = () => {
      document.documentElement.style.setProperty('--viewport-height', `${viewport.height}px`);
    };
    viewport.addEventListener('resize', handleResize);
    viewport.addEventListener('scroll', handleResize);
    handleResize();
    return () => {
      viewport.removeEventListener('resize', handleResize);
      viewport.removeEventListener('scroll', handleResize);
    };
  }, []);

  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  }, []);

  // Auto-scroll guesses
  useEffect(() => {
    if (guessListRef.current) {
      guessListRef.current.scrollTo({ top: guessListRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [chatMessages]);

  const remoteLastPosRef = useRef({ x: 0, y: 0 });
  const permanentCanvasRef = useRef(null);
  const remotePreviewCanvasRef = useRef(null);

  const clearRemotePreview = useCallback(() => {
    const c = remotePreviewCanvasRef.current;
    if (c) c.getContext('2d').clearRect(0, 0, c.width, c.height);
  }, []);

  const renderRemoteStroke = useCallback((data) => {
    const c = remotePreviewCanvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.strokeStyle = data.color || '#000';
    ctx.lineWidth = data.size || 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    if (data.type === 'livePoint' && data.points && data.points.length >= 2) {
      const pts = data.points;
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length - 1; i++) {
        const mx = (pts[i].x + pts[i+1].x) / 2;
        const my = (pts[i].y + pts[i+1].y) / 2;
        ctx.quadraticCurveTo(pts[i].x, pts[i].y, mx, my);
      }
      ctx.lineTo(pts[pts.length-1].x, pts[pts.length-1].y);
      ctx.stroke();
    }
  }, []);

  const drawOnCanvas = useCallback((data) => {
    const canvas = permanentCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (data.type === 'start') {
      ctx.strokeStyle = data.color;
      ctx.lineWidth = data.size;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(data.x, data.y);
      remoteLastPosRef.current = { x: data.x, y: data.y };
    } else if (data.type === 'draw') {
      ctx.strokeStyle = data.color;
      ctx.lineWidth = data.size;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      const last = remoteLastPosRef.current;
      const midX = (last.x + data.x) / 2;
      const midY = (last.y + data.y) / 2;
      ctx.quadraticCurveTo(last.x, last.y, midX, midY);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(midX, midY);
      remoteLastPosRef.current = { x: data.x, y: data.y };
    } else if (data.type === 'freehand') {
      const pts = data.points;
      if (!pts || pts.length < 2) return;
      ctx.strokeStyle = data.color;
      ctx.lineWidth = data.size;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length - 1; i++) {
        const mx = (pts[i].x + pts[i+1].x) / 2;
        const my = (pts[i].y + pts[i+1].y) / 2;
        ctx.quadraticCurveTo(pts[i].x, pts[i].y, mx, my);
      }
      ctx.lineTo(pts[pts.length-1].x, pts[pts.length-1].y);
      ctx.stroke();
    } else if (data.type === 'circle') {
      ctx.strokeStyle = data.color;
      ctx.lineWidth = data.size;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(data.cx, data.cy, data.r, 0, Math.PI * 2);
      ctx.stroke();
    } else if (data.type === 'ellipse') {
      ctx.strokeStyle = data.color;
      ctx.lineWidth = data.size;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.ellipse(data.cx, data.cy, data.rx, data.ry, 0, 0, Math.PI * 2);
      ctx.stroke();
    } else if (data.type === 'arc') {
      ctx.strokeStyle = data.color;
      ctx.lineWidth = data.size;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(data.cx, data.cy, data.r, data.startAngle, data.endAngle, data.anticlockwise);
      ctx.stroke();
    } else if (data.type === 'line') {
      ctx.strokeStyle = data.color;
      ctx.lineWidth = data.size;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(data.x1, data.y1);
      ctx.lineTo(data.x2, data.y2);
      ctx.stroke();
    } else if (data.type === 'clear') {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }, []);

  // Centralized round-finish: atomic, safe against multiple callers
  const finishRound = useCallback(async () => {
    if (!roomCode) return;
    const gameStateRef = ref(db, `rooms/${roomCode}/gameState`);

    // Atomically flip roundStatus — only first caller wins
    let alreadyFinished = false;
    await runTransaction(gameStateRef, (current) => {
      if (!current) return current;
      if (current.roundStatus !== 'drawing') { alreadyFinished = true; return; }
      return { ...current, roundStatus: 'round_finished', roundEnded: true };
    });
    if (alreadyFinished) return;

    // Award drawer points (once, inside same host client that won the transaction)
    const snap = await get(gameStateRef);
    const state = snap.val();
    if (!state || state.drawerPointsAwarded) return;
    const guessedCount = Object.keys(state.guessedPlayers || {}).length;
    if (guessedCount > 0) {
      const drawerPoints = guessedCount * 10;
      const drawerId = playersRef2.current[state.currentDrawerIndex || 0]?.id;
      if (drawerId) {
        await runTransaction(ref(db, `rooms/${roomCode}/players/${drawerId}/score`), (cur) => (cur || 0) + drawerPoints);
      }
    }
    await update(gameStateRef, { drawerPointsAwarded: true });
  }, [roomCode]);

  const nextRound = useCallback(async () => {
    if (!roomCode || !currentPlayer?.isHost) return;
    const gameStateRef = ref(db, `rooms/${roomCode}/gameState`);
    const freshSnapshot = await get(gameStateRef);
    if (!freshSnapshot.exists()) return;
    const freshState = freshSnapshot.val();

    const currentDrawerIdx = freshState.currentDrawerIndex || 0;
    const currentRoundNum = freshState.currentRound || 1;
    const currentPlayers = playersRef2.current.slice().sort((a, b) => (a.joinedAt || 0) - (b.joinedAt || 0));
    const totalRoundsInGame = freshState.totalRounds || totalRoundsRef.current;

    let nextDrawerIndex = (currentDrawerIdx + 1) % currentPlayers.length;
    let nextRoundNum = currentRoundNum;
    if (nextDrawerIndex === 0) nextRoundNum = currentRoundNum + 1;

    if (nextRoundNum > totalRoundsInGame) {
      await update(gameStateRef, { gameOver: true });
      return;
    }

    // Generate 3 word options for next drawer
    const currentUsedWords = new Set(freshState.usedWords || []);
    const options = getThreeWords(currentUsedWords);

    await set(ref(db, `rooms/${roomCode}/drawing`), null);
    await set(ref(db, `rooms/${roomCode}/chat`), null);

    await update(gameStateRef, {
      currentDrawerIndex: nextDrawerIndex,
      currentRound: nextRoundNum,
      currentWord: '',
      wordOptions: options,
      roundStatus: 'choosing_word',
      timeLeft: 60,
      roundStartTime: null,
      roundEndsAt: null,
      correctGuessers: [],
      correctGuessCount: 0,
      guessedPlayers: {},
      roundEnded: false,
      revealedLetters: {},
      drawerPointsAwarded: false,
    });
  }, [roomCode, currentPlayer]);

  // Initialize game state
  useEffect(() => {
    if (gameSettings?.rounds) {
      const r = parseInt(gameSettings.rounds);
      setTotalRounds(r);
      totalRoundsRef.current = r;
    }
    if (!roomCode || !currentPlayer?.isHost) return;

    const checkAndInitialize = async () => {
      const gameStateRef = ref(db, `rooms/${roomCode}/gameState`);
      const snapshot = await get(gameStateRef);
      if (!snapshot.exists() || snapshot.val()?.gameOver) {
        const rounds = parseInt(gameSettings?.rounds) || 3;
        const options = getThreeWords(new Set());
        await set(gameStateRef, {
          roundStatus: 'choosing_word',
          currentRound: 1,
          currentDrawerIndex: 0,
          timeLeft: 60,
          currentWord: '',
          wordOptions: options,
          totalRounds: rounds,
          roundStartTime: null,
          roundEndsAt: null,
          correctGuessers: [],
          correctGuessCount: 0,
          guessedPlayers: {},
          roundEnded: false,
          gameOver: false,
          revealedLetters: {},
          usedWords: [],
          drawerPointsAwarded: false,
        });
      }
    };
    checkAndInitialize();
  }, [gameSettings, roomCode, currentPlayer]);

  // Server-synced timer: calculate from roundEndsAt
  useEffect(() => {
    if (roundStatus !== 'drawing') return;
    const interval = setInterval(() => {
      const gameStateRef = ref(db, `rooms/${roomCode}/gameState`);
      get(gameStateRef).then(snap => {
        const data = snap.val();
        if (!data?.roundEndsAt) return;
        const remaining = Math.max(0, Math.round((data.roundEndsAt - Date.now()) / 1000));
        setTimeLeft(remaining);
        if (remaining === 0 && !roundEndedRef.current) {
          finishRound();
        }
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [roundStatus, roomCode, currentPlayer, finishRound]);

  // Auto-advance round when roundEnded
  useEffect(() => {
    if (roundEnded && currentPlayer?.isHost) {
      roundEndedRef.current = true;
      const timer = setTimeout(() => {
        if (roundEndedRef.current) {
          nextRound();
          roundEndedRef.current = false;
        }
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [roundEnded, currentPlayer, nextRound]);

  // Firebase listeners
  useEffect(() => {
    if (!roomCode) return;

    const playersRef = ref(db, `rooms/${roomCode}/players`);
    const unsubPlayers = onValue(playersRef, (snap) => {
      const data = snap.val();
      if (data) {
        const list = Object.values(data)
          .map(p => ({ ...p, score: p.score || 0 }))
          .sort((a, b) => (a.joinedAt || 0) - (b.joinedAt || 0));
        setPlayers(list);

        // Re-check round end when a player leaves mid-round
        const gsRef = ref(db, `rooms/${roomCode}/gameState`);
        get(gsRef).then(gsSnap => {
          const gs = gsSnap.val();
          if (!gs || gs.roundStatus !== 'drawing') return;
          const drawerId = list[gs.currentDrawerIndex || 0]?.id;
          const eligible = list.filter(p => p.id !== drawerId);
          const guessedCount = Object.keys(gs.guessedPlayers || {}).length;
          if (eligible.length > 0 && guessedCount >= eligible.length) {
            finishRound();
          }
        });
      }
    });

    const drawingRef = ref(db, `rooms/${roomCode}/drawing`);
    // Full replay only on initial load or clear
    const unsubDrawing = onValue(drawingRef, (snap) => {
      if (isDrawingRef.current) return;
      const canvas = permanentCanvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      const data = snap.val();
      if (data) Object.values(data)
        .sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0))
        .forEach(d => drawOnCanvas(d));
    });

    // Live stroke from drawer — renders on remote clients only
    const activeStrokeRef = ref(db, `rooms/${roomCode}/activeStroke`);
    const unsubActive = onValue(activeStrokeRef, (snap) => {
      if (isDrawingRef.current) return;
      const data = snap.val();
      if (!data) {
        clearRemotePreview();
        return;
      }
      renderRemoteStroke(data);
    });

    const gameStateRef = ref(db, `rooms/${roomCode}/gameState`);
    const unsubGameState = onValue(gameStateRef, (snap) => {
      const data = snap.val();
      if (!data) return;

      const newStatus = data.roundStatus || 'choosing_word';
      setRoundStatus(newStatus);
      setRound(data.currentRound || 1);
      setCurrentDrawerIndex(data.currentDrawerIndex || 0);
      setCurrentWord(data.currentWord || '');
      setWordOptions(data.wordOptions || []);
      setRevealedLetters(data.revealedLetters || {});
      if (data.totalRounds) totalRoundsRef.current = data.totalRounds;

      // Sync timer from server
      if (newStatus === 'drawing' && data.roundEndsAt) {
        if (data.roundStartTime !== lastRoundStartTimeRef.current) {
          lastRoundStartTimeRef.current = data.roundStartTime;
          const remaining = Math.max(0, Math.round((data.roundEndsAt - Date.now()) / 1000));
          setTimeLeft(remaining);
        }
      } else if (newStatus === 'choosing_word') {
        setTimeLeft(60);
      }

      // Check if current player already guessed correctly this round
      if (currentPlayer && data.guessedPlayers?.[currentPlayer.id]) {
        setAlreadyGuessedCorrectly(true);
        setMyCorrectPoints(data.guessedPlayers[currentPlayer.id].points || 0);
      } else {
        setAlreadyGuessedCorrectly(false);
        setMyCorrectPoints(0);
      }

      if (data.roundEnded) {
        setRoundEnded(true);
      } else {
        setRoundEnded(false);
        roundEndedRef.current = false;
      }

      if (data.gameOver) {
        navigate('/gameover', {
          state: {
            players: playersRef2.current.map(p => ({ ...p, score: p.score || 0 })),
            roomCode,
            gameSettings,
            currentPlayer
          }
        });
      }
    });

    const chatRef = ref(db, `rooms/${roomCode}/chat`);
    const unsubChat = onValue(chatRef, (snap) => {
      const data = snap.val();
      if (data) {
        const messages = Object.values(data).sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
        setChatMessages(messages);
      } else {
        setChatMessages([]);
      }
    });

    return () => {
      unsubPlayers();
      unsubDrawing();
      unsubActive();
      unsubGameState();
      unsubChat();
    };
  }, [roomCode, navigate, gameSettings, currentPlayer, drawOnCanvas]);

  // Drawer selects a word
  const handleWordSelect = useCallback(async (word) => {
    if (!roomCode || !word) return;
    const gameStateRef = ref(db, `rooms/${roomCode}/gameState`);

    // Use transaction to prevent double-selection
    await runTransaction(gameStateRef, (current) => {
      if (!current) return current;
      if (current.roundStatus !== 'choosing_word') return; // abort
      const now = Date.now();
      const endsAt = now + 60000;
      return {
        ...current,
        currentWord: word,
        roundStatus: 'drawing',
        roundStartTime: now,
        roundEndsAt: endsAt,
        timeLeft: 60,
        wordOptions: [],
        usedWords: [...(current.usedWords || []), word],
      };
    });
  }, [roomCode]);

  // Throttle ref for live stroke updates
  const lastSendRef = useRef(0);
  const SEND_INTERVAL = 30; // ms — ~33fps max to Firebase

  const sendDrawing = useCallback((drawData) => {
    if (!roomCode) return;
    // Completed strokes (line/circle/ellipse/arc/start+draw batch) go to permanent node
    if (drawData.type === 'commit') {
      const drawingRef = ref(db, `rooms/${roomCode}/drawing`);
      push(drawingRef, { ...drawData.stroke, player: currentPlayer?.name, timestamp: Date.now() });
      // Clear the active stroke node
      set(ref(db, `rooms/${roomCode}/activeStroke`), null);
      return;
    }
    if (drawData.type === 'clear') {
      const drawingRef = ref(db, `rooms/${roomCode}/drawing`);
      push(drawingRef, { type: 'clear', timestamp: Date.now() });
      set(ref(db, `rooms/${roomCode}/activeStroke`), null);
      return;
    }
    // Live freehand points — throttled, written to activeStroke (overwrites, no accumulation)
    const now = Date.now();
    if (now - lastSendRef.current < SEND_INTERVAL) return;
    lastSendRef.current = now;
    set(ref(db, `rooms/${roomCode}/activeStroke`), {
      ...drawData,
      player: currentPlayer?.name,
      ts: now,
    });
  }, [roomCode, currentPlayer]);

  // Atomic correct-guess scoring
  const sendGuess = useCallback(async () => {
    if (isSending) return;
    const trimmed = guessInput.trim();
    if (!trimmed || !roomCode || !currentPlayer) return;
    if (isCurrentPlayerDrawing) return;
    if (alreadyGuessedCorrectly) return;

    setIsSending(true);
    setGuessInput('');

    const guess = normalizeAnswer(trimmed);
    const correctWord = normalizeAnswer(currentWord);
    const isCorrect = guess === correctWord;

    if (isCorrect) {
      const gameStateRef = ref(db, `rooms/${roomCode}/gameState`);
      let earnedPoints = 10;

      await runTransaction(gameStateRef, (current) => {
        if (!current) return current;
        if (current.roundStatus !== 'drawing') return current;
        const guessedPlayers = current.guessedPlayers || {};
        if (guessedPlayers[currentPlayer.id]) return current;
        const count = current.correctGuessCount || 0;
        const points = Math.max(10, 100 - count * 10);
        earnedPoints = points;
        return {
          ...current,
          correctGuessCount: count + 1,
          correctGuessers: [...(current.correctGuessers || []), currentPlayer.id],
          guessedPlayers: { ...guessedPlayers, [currentPlayer.id]: { position: count, points } }
        };
      });

      const playerScoreRef = ref(db, `rooms/${roomCode}/players/${currentPlayer.id}/score`);
      await runTransaction(playerScoreRef, (cur) => (cur || 0) + earnedPoints);

      const chatRef = ref(db, `rooms/${roomCode}/chat`);
      push(chatRef, {
        id: `correct-${Date.now()}`,
        player: currentPlayer.name,
        playerId: currentPlayer.id,
        message: '✅ Guessed correctly!',
        points: earnedPoints,
        time: new Date().toLocaleTimeString(),
        type: 'correct',
        timestamp: Date.now()
      });

      setAlreadyGuessedCorrectly(true);
      setMyCorrectPoints(earnedPoints);
      showToast(`Correct! +${earnedPoints} points`, 'success');

      // Check eligibility for early round end
      const snap = await get(gameStateRef);
      const state = snap.val();
      if (!state) { setIsSending(false); return; }

      const allPlayers = playersRef2.current;
      const drawerId = allPlayers[state.currentDrawerIndex || 0]?.id;
      const eligibleGuessers = allPlayers.filter(p => p.id !== drawerId);
      const eligibleCount = eligibleGuessers.length;
      const guessedCount = Object.keys(state.guessedPlayers || {}).length;
      const everyoneGuessed = eligibleCount > 0 && guessedCount >= eligibleCount;

      if (everyoneGuessed) {
        await finishRound();
      }
    } else {
      const chatRef = ref(db, `rooms/${roomCode}/chat`);
      push(chatRef, {
        id: `guess-${Date.now()}`,
        player: currentPlayer.name,
        playerId: currentPlayer.id,
        message: trimmed,
        time: new Date().toLocaleTimeString(),
        type: 'guess',
        timestamp: Date.now()
      });

      // Reveal correctly positioned letters
      const newRevealed = { ...revealedLetters };
      if (!newRevealed[currentPlayer.id]) newRevealed[currentPlayer.id] = {};
      let hasNew = false;
      for (let i = 0; i < Math.min(guess.length, correctWord.length); i++) {
        if (guess[i] === correctWord[i] && !newRevealed[currentPlayer.id][i]) {
          newRevealed[currentPlayer.id][i] = currentWord[i];
          hasNew = true;
        }
      }
      if (hasNew) {
        setRevealedLetters(newRevealed);
        await update(ref(db, `rooms/${roomCode}/gameState`), { revealedLetters: newRevealed });
        showToast('Correct letter position revealed!', 'info');
      }
    }

    setIsSending(false);
  }, [isSending, guessInput, roomCode, currentPlayer, isCurrentPlayerDrawing, alreadyGuessedCorrectly, currentWord, revealedLetters, showToast, finishRound]);

  const getWordHint = (word, playerId) => {
    if (!word) return '';
    const playerRevealed = revealedLetters[playerId] || {};
    return word.split('').map((char, i) => {
      if (char === ' ') return '  ';
      return playerRevealed[i] ? playerRevealed[i] : '_';
    }).join(' ');
  };

  return (
    <div className={`${styles.gameContainer} ${inputFocused ? styles.keyboardOpen : ''}`}>
      {/* Word choice overlay for drawer */}
      {roundStatus === 'choosing_word' && isCurrentPlayerDrawing && wordOptions.length > 0 && (
        <WordChoice words={wordOptions} onSelect={handleWordSelect} drawerName={currentDrawerName} />
      )}

      <div className={styles.gameWrapper}>
        {/* Compact mobile header */}
        <GameHeader
          round={round}
          totalRounds={totalRounds}
          playersLength={players.length}
          timeLeft={timeLeft}
          roundStatus={roundStatus}
          inputFocused={inputFocused}
          currentDrawerName={currentDrawerName}
          currentWord={currentWord}
          isDrawer={isCurrentPlayerDrawing}
        />

        <div className={`${styles.gameGrid} ${inputFocused ? styles.gameGridFocused : ''}`}>
          {/* Players panel — collapsible on mobile */}
          <div className={`${styles.playerPanelWrapper} ${inputFocused ? styles.hiddenOnFocus : ''}`}>
            <PlayerList
              players={players}
              currentDrawerIndex={currentDrawerIndex}
              expanded={playersExpanded}
              onToggle={() => setPlayersExpanded(p => !p)}
            />
          </div>

          {/* Canvas panel */}
          <div>
            {roundStatus === 'choosing_word' && !isCurrentPlayerDrawing ? (
              <div className={styles.canvasPanel}>
                <WaitingForWord drawerName={currentDrawerName} />
              </div>
            ) : (
              <GameCanvas
                currentWord={currentWord}
                roundStatus={roundStatus}
                currentDrawerName={currentDrawerName}
                currentDrawerId={currentDrawerId}
                isCurrentPlayerDrawing={isCurrentPlayerDrawing}
                onSendDrawing={sendDrawing}
                revealedLetters={revealedLetters}
                currentPlayerId={currentPlayer?.id}
                currentPlayerName={currentPlayer?.name}
                round={round}
                isDrawingRef={isDrawingRef}
                getWordHint={getWordHint}
                permanentCanvasRef={permanentCanvasRef}
                remotePreviewCanvasRef={remotePreviewCanvasRef}
              />
            )}
          </div>

          {/* Chat / Guess panel */}
          <div>
            <ChatPanel
              messages={chatMessages}
              isDrawer={isCurrentPlayerDrawing}
              guessInput={guessInput}
              setGuessInput={setGuessInput}
              sendGuess={sendGuess}
              players={players}
              isSending={isSending}
              alreadyGuessedCorrectly={alreadyGuessedCorrectly}
              myCorrectPoints={myCorrectPoints}
              roundStatus={roundStatus}
              guessListRef={guessListRef}
              onInputFocus={() => setInputFocused(true)}
              onInputBlur={() => setInputFocused(false)}
            />
          </div>
        </div>
      </div>

      <div className={styles.toastContainer}>
        {toasts.map(toast => (
          <Toast key={toast.id} message={toast.message} type={toast.type} />
        ))}
      </div>
    </div>
  );
};

const GameHeader = ({ round, totalRounds, playersLength, timeLeft, roundStatus, inputFocused, currentDrawerName, currentWord, isDrawer }) => {
  const hint = currentWord
    ? currentWord.split('').map(c => c === ' ' ? '  ' : '_').join(' ')
    : '';

  if (inputFocused) {
    return (
      <div className={styles.headerCompact}>
        <span className={styles.headerCompactDrawer}>
          🎨 {currentDrawerName}
        </span>
        <span className={styles.headerCompactHint}>
          {isDrawer ? currentWord : hint}
        </span>
        <span className={`${styles.headerCompactTimer} ${timeLeft <= 10 ? styles.timerWarning : ''}`}>
          {timeLeft}s
        </span>
      </div>
    );
  }

  return (
    <div className={styles.header}>
      <div className={styles.headerContent}>
        <div className={styles.headerLeft}>
          <div className={styles.headerIcon}><Trophy /></div>
          <div>
            <h1 className={styles.headerTitle}>Guess The Image</h1>
            <p className={styles.headerSubtitle}>Round {round} of {totalRounds} · {playersLength} players</p>
          </div>
        </div>
        <div className={styles.headerRight}>
          {roundStatus === 'drawing' && (
            <div className={styles.timerBox}>
              <Clock />
              <span className={`${styles.timerText} ${timeLeft <= 10 ? styles.timerWarning : ''}`}>
                {timeLeft}s
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const PlayerList = ({ players, currentDrawerIndex, expanded, onToggle }) => (
  <div className={styles.playerPanel}>
    <button className={styles.playerHeader} onClick={onToggle}>
      <Users />
      <h2 className={styles.playerTitle}>Players ({players.length})</h2>
      <span className={styles.playerToggle}>{expanded ? '▲' : '▼'}</span>
    </button>
    <div className={`${styles.playerList} ${expanded ? styles.playerListExpanded : styles.playerListCollapsed}`}>
      {players.map((player, index) => (
        <div
          key={player.id}
          className={`${styles.playerItem} ${index === currentDrawerIndex ? styles.playerItemActive : styles.playerItemInactive}`}
        >
          <div className={styles.playerInfo}>
            <span className={styles.playerAvatar}>{player.avatar}</span>
            <div>
              <p className={`${styles.playerName} ${index === currentDrawerIndex ? styles.playerNameActive : ''}`}>
                {player.name}{index === currentDrawerIndex ? ' ✏️' : ''}
              </p>
              <p className={styles.playerScore}>{player.score || 0} pts</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const QS = {
  holdMs: 500,
  holdTolerance: 6,
  minShapeDist: 10,
  lineDeviationThreshold: 0.06,
  closeLoopThreshold: 0.22,
  circleAspectThreshold: 0.82,
  ellipseFitThreshold: 0.28,
  arcCurvatureThreshold: 0.55,
  minConfidence: 0.60,
  minPoints: 5,
};

function ptDist(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function distFromLine(p, a, b) {
  const dx = b.x - a.x, dy = b.y - a.y;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return ptDist(p, a);
  const t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / lenSq;
  return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
}

function boundingBox(pts) {
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const p of pts) {
    if (p.x < minX) minX = p.x; if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y; if (p.y > maxY) maxY = p.y;
  }
  return { minX, maxX, minY, maxY, w: maxX - minX, h: maxY - minY };
}

function curvatureConsistency(pts) {
  let pos = 0, neg = 0;
  for (let i = 0; i < pts.length - 2; i++) {
    const v1x = pts[i+1].x - pts[i].x, v1y = pts[i+1].y - pts[i].y;
    const v2x = pts[i+2].x - pts[i+1].x, v2y = pts[i+2].y - pts[i+1].y;
    const cross = v1x * v2y - v1y * v2x;
    if (Math.hypot(v1x, v1y) < 1.5) continue;
    if (cross > 0) pos++; else if (cross < 0) neg++;
  }
  const total = pos + neg;
  return total === 0 ? 0 : Math.max(pos, neg) / total;
}

function circleFrom3(p1, p2, p3) {
  const ax = p1.x, ay = p1.y, bx = p2.x, by = p2.y, cx = p3.x, cy = p3.y;
  const D = 2 * (ax * (by - cy) + bx * (cy - ay) + cx * (ay - by));
  if (Math.abs(D) < 1e-6) return null;
  const ux = ((ax*ax+ay*ay)*(by-cy) + (bx*bx+by*by)*(cy-ay) + (cx*cx+cy*cy)*(ay-by)) / D;
  const uy = ((ax*ax+ay*ay)*(cx-bx) + (bx*bx+by*by)*(ax-cx) + (cx*cx+cy*cy)*(bx-ax)) / D;
  return { cx: ux, cy: uy, r: Math.hypot(ax - ux, ay - uy) };
}

function detectQuickShape(pts) {
  if (pts.length < QS.minPoints) return { type: 'curve' };
  const start = pts[0], end = pts[pts.length - 1];
  const bb = boundingBox(pts);
  const bbSize = Math.max(bb.w, bb.h);
  if (bbSize < QS.minShapeDist) return { type: 'curve' };

  // 1. LINE
  const chordLen = ptDist(start, end);
  let totalDev = 0;
  for (const p of pts) totalDev += distFromLine(p, start, end);
  const normDev = (totalDev / pts.length) / Math.max(chordLen, 1);
  if (normDev < QS.lineDeviationThreshold && chordLen > QS.minShapeDist) {
    return { type: 'line', geometry: { start, end }, confidence: 1 - normDev };
  }

  // 2. CIRCLE / ELLIPSE
  const isClosedLoop = ptDist(start, end) < bbSize * QS.closeLoopThreshold;
  if (isClosedLoop) {
    const cx = (bb.minX + bb.maxX) / 2, cy = (bb.minY + bb.maxY) / 2;
    const rx = bb.w / 2, ry = bb.h / 2;
    if (rx > 4 && ry > 4) {
      let fitErr = 0;
      for (const p of pts) {
        const dx = (p.x - cx) / rx, dy = (p.y - cy) / ry;
        fitErr += Math.abs(dx * dx + dy * dy - 1);
      }
      const avgFitErr = fitErr / pts.length;
      if (avgFitErr < QS.ellipseFitThreshold) {
        const aspect = Math.min(rx, ry) / Math.max(rx, ry);
        if (aspect > QS.circleAspectThreshold) {
          return { type: 'circle', geometry: { cx, cy, r: (rx + ry) / 2 }, confidence: 1 - avgFitErr };
        }
        return { type: 'ellipse', geometry: { cx, cy, rx, ry }, confidence: 1 - avgFitErr };
      }
    }
  }

  // 3. ARC
  const consistency = curvatureConsistency(pts);
  if (consistency >= QS.arcCurvatureThreshold) {
    const mid = pts[Math.floor(pts.length / 2)];
    const circle = circleFrom3(start, mid, end);
    if (circle && circle.r < bbSize * 8 && circle.r > bbSize * 0.3) {
      const startAngle = Math.atan2(start.y - circle.cy, start.x - circle.cx);
      const endAngle = Math.atan2(end.y - circle.cy, end.x - circle.cx);
      let pos = 0, neg = 0;
      for (let i = 0; i < pts.length - 2; i++) {
        const v1x = pts[i+1].x - pts[i].x, v1y = pts[i+1].y - pts[i].y;
        const v2x = pts[i+2].x - pts[i+1].x, v2y = pts[i+2].y - pts[i+1].y;
        const cross = v1x * v2y - v1y * v2x;
        if (cross > 0) pos++; else if (cross < 0) neg++;
      }
      return {
        type: 'arc',
        geometry: { cx: circle.cx, cy: circle.cy, r: circle.r, startAngle, endAngle, anticlockwise: neg > pos },
        confidence: consistency,
      };
    }
  }

  // 4. SMOOTH CURVE fallback
  return { type: 'curve', geometry: { pts }, confidence: 0.5 };
}

const GameCanvas = React.memo(({
  currentWord, roundStatus, currentDrawerName, currentDrawerId,
  isCurrentPlayerDrawing, onSendDrawing, revealedLetters,
  currentPlayerId, currentPlayerName, round, isDrawingRef, getWordHint,
  permanentCanvasRef, remotePreviewCanvasRef
}) => {
  const isDrawer = (currentPlayerId && currentDrawerId && currentPlayerId === currentDrawerId) ||
    (currentPlayerName && currentDrawerName && currentPlayerName === currentDrawerName);

  const previewCanvasRef = useRef(null);
  const [brushSize, setBrushSize] = useState(5);
  const [brushColor, setBrushColor] = useState('#000000');
  const [tool, setTool] = useState('brush');

  // Stroke lifecycle refs
  const isDrawingStateRef = useRef(false);
  const strokeCommittedRef = useRef(false);
  const activePointerIdRef = useRef(null);
  const strokeSessionRef = useRef(0);
  const strokeStartRef = useRef(null);
  const lastMoveRef = useRef({ x: 0, y: 0 });
  const currentStrokePointsRef = useRef([]);
  const quickShapeRef = useRef(null); // null = freehand, else { type, geometry }
  const holdTimerRef = useRef(null);
  const rafRef = useRef(null);

  const colors = ['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500'];

  const getCanvasPos = (e) => {
    const canvas = previewCanvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (canvas.width / rect.width),
      y: (e.clientY - rect.top) * (canvas.height / rect.height)
    };
  };

  const applyCtxStyle = (ctx) => {
    ctx.strokeStyle = tool === 'eraser' ? '#FFFFFF' : brushColor;
    ctx.lineWidth = tool === 'eraser' ? brushSize * 2 : brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  };

  const clearPreview = () => {
    const canvas = previewCanvasRef.current;
    if (!canvas) return;
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
  };

  const clearHoldTimer = () => {
    clearTimeout(holdTimerRef.current);
    holdTimerRef.current = null;
  };

  const cancelRaf = () => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  };

  // Reset canvas on new word/round
  useEffect(() => {
    const canvas = permanentCanvasRef?.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    clearPreview();
    clearHoldTimer();
    cancelRaf();
    quickShapeRef.current = null;
    isDrawingStateRef.current = false;
    strokeCommittedRef.current = false;
    activePointerIdRef.current = null;
  }, [currentWord, permanentCanvasRef]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => () => { clearHoldTimer(); cancelRaf(); }, []);

  const drawSmoothedCurve = (ctx, pts) => {
    if (pts.length < 2) return;
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length - 1; i++) {
      const midX = (pts[i].x + pts[i+1].x) / 2;
      const midY = (pts[i].y + pts[i+1].y) / 2;
      ctx.quadraticCurveTo(pts[i].x, pts[i].y, midX, midY);
    }
    ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
    ctx.stroke();
  };

  const renderPreview = () => {
    const preview = previewCanvasRef.current;
    if (!preview) return;
    const ctx = preview.getContext('2d');
    ctx.clearRect(0, 0, preview.width, preview.height);
    applyCtxStyle(ctx);

    const qs = quickShapeRef.current;
    if (qs) {
      const g = qs.geometry;
      ctx.beginPath();
      if (qs.type === 'line') {
        // endpoint follows pointer while holding
        const end = lastMoveRef.current;
        ctx.moveTo(g.start.x, g.start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
      } else if (qs.type === 'circle') {
        ctx.arc(g.cx, g.cy, g.r, 0, Math.PI * 2);
        ctx.stroke();
      } else if (qs.type === 'ellipse') {
        ctx.ellipse(g.cx, g.cy, g.rx, g.ry, 0, 0, Math.PI * 2);
        ctx.stroke();
      } else if (qs.type === 'arc') {
        ctx.arc(g.cx, g.cy, g.r, g.startAngle, g.endAngle, g.anticlockwise);
        ctx.stroke();
      } else {
        // curve fallback
        drawSmoothedCurve(ctx, g.pts);
      }
    } else {
      const pts = currentStrokePointsRef.current;
      drawSmoothedCurve(ctx, pts);
    }
  };

  const scheduleRender = () => {
    cancelRaf();
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      renderPreview();
    });
  };

  const activateQuickShape = (sessionId) => {
    if (
      sessionId !== strokeSessionRef.current ||
      !isDrawingStateRef.current ||
      strokeCommittedRef.current
    ) return;
    const pts = currentStrokePointsRef.current;
    const result = detectQuickShape(pts);
    quickShapeRef.current = result.confidence >= QS.minConfidence ? result : { type: 'curve', geometry: { pts } };
    scheduleRender();
    if (window.navigator?.vibrate) window.navigator.vibrate(30);
  };

  const scheduleQuickShape = (x, y) => {
    clearHoldTimer();
    const pts = currentStrokePointsRef.current;
    if (pts.length >= 2) {
      const bb = boundingBox(pts);
      if (Math.max(bb.w, bb.h) < QS.minShapeDist) return;
    }
    const sessionId = strokeSessionRef.current;
    holdTimerRef.current = setTimeout(() => activateQuickShape(sessionId), QS.holdMs);
  };

  const commitStroke = () => {
    if (strokeCommittedRef.current) return;
    strokeCommittedRef.current = true;

    const permanent = permanentCanvasRef?.current;
    if (!permanent) return;
    const ctx = permanent.getContext('2d');
    const strokeColor = tool === 'eraser' ? '#FFFFFF' : brushColor;
    const strokeWidth = tool === 'eraser' ? brushSize * 2 : brushSize;
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const qs = quickShapeRef.current;
    if (qs) {
      const g = qs.geometry;
      ctx.beginPath();
      if (qs.type === 'line') {
        const end = lastMoveRef.current;
        ctx.moveTo(g.start.x, g.start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
        onSendDrawing({ type: 'commit', stroke: { type: 'line', x1: g.start.x, y1: g.start.y, x2: end.x, y2: end.y, color: strokeColor, size: strokeWidth } });
      } else if (qs.type === 'circle') {
        ctx.arc(g.cx, g.cy, g.r, 0, Math.PI * 2);
        ctx.stroke();
        onSendDrawing({ type: 'commit', stroke: { type: 'circle', cx: g.cx, cy: g.cy, r: g.r, color: strokeColor, size: strokeWidth } });
      } else if (qs.type === 'ellipse') {
        ctx.ellipse(g.cx, g.cy, g.rx, g.ry, 0, 0, Math.PI * 2);
        ctx.stroke();
        onSendDrawing({ type: 'commit', stroke: { type: 'ellipse', cx: g.cx, cy: g.cy, rx: g.rx, ry: g.ry, color: strokeColor, size: strokeWidth } });
      } else if (qs.type === 'arc') {
        ctx.arc(g.cx, g.cy, g.r, g.startAngle, g.endAngle, g.anticlockwise);
        ctx.stroke();
        onSendDrawing({ type: 'commit', stroke: { type: 'arc', cx: g.cx, cy: g.cy, r: g.r, startAngle: g.startAngle, endAngle: g.endAngle, anticlockwise: g.anticlockwise, color: strokeColor, size: strokeWidth } });
      } else {
        const pts = g.pts;
        if (pts && pts.length >= 2) {
          ctx.moveTo(pts[0].x, pts[0].y);
          for (let i = 1; i < pts.length - 1; i++) {
            const midX = (pts[i].x + pts[i+1].x) / 2;
            const midY = (pts[i].y + pts[i+1].y) / 2;
            ctx.quadraticCurveTo(pts[i].x, pts[i].y, midX, midY);
          }
          ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
          ctx.stroke();
          onSendDrawing({ type: 'commit', stroke: { type: 'freehand', points: pts, color: strokeColor, size: strokeWidth } });
        }
      }
    } else {
      const pts = currentStrokePointsRef.current;
      if (pts.length >= 2) {
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < pts.length - 1; i++) {
          const midX = (pts[i].x + pts[i+1].x) / 2;
          const midY = (pts[i].y + pts[i+1].y) / 2;
          ctx.quadraticCurveTo(pts[i].x, pts[i].y, midX, midY);
        }
        ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
        ctx.stroke();
        onSendDrawing({ type: 'commit', stroke: { type: 'freehand', points: pts, color: strokeColor, size: strokeWidth } });
      }
    }
  };

  const endStroke = (e) => {
    if (!isDrawingStateRef.current) return;
    if (activePointerIdRef.current !== null && e.pointerId !== activePointerIdRef.current) return;

    clearHoldTimer();
    cancelRaf();

    const canvas = previewCanvasRef.current;
    if (canvas?.hasPointerCapture?.(e.pointerId)) {
      canvas.releasePointerCapture(e.pointerId);
    }

    commitStroke();
    clearPreview();

    isDrawingStateRef.current = false;
    if (isDrawingRef) isDrawingRef.current = false;
    activePointerIdRef.current = null;
    quickShapeRef.current = null;
    strokeStartRef.current = null;
    currentStrokePointsRef.current = [];
  };

  const onPointerDown = (e) => {
    if (!isDrawer || roundStatus !== 'drawing') return;
    if (activePointerIdRef.current !== null) return;
    e.preventDefault();

    const canvas = previewCanvasRef.current;
    canvas.setPointerCapture(e.pointerId);
    activePointerIdRef.current = e.pointerId;

    strokeSessionRef.current += 1;
    strokeCommittedRef.current = false;
    quickShapeRef.current = null;

    const { x, y } = getCanvasPos(e);
    strokeStartRef.current = { x, y };
    lastMoveRef.current = { x, y };
    currentStrokePointsRef.current = [{ x, y }];

    isDrawingStateRef.current = true;
    if (isDrawingRef) isDrawingRef.current = true;
  };

  const onPointerMove = (e) => {
    if (!isDrawingStateRef.current) return;
    if (e.pointerId !== activePointerIdRef.current) return;
    e.preventDefault();

    const { x, y } = getCanvasPos(e);
    lastMoveRef.current = { x, y };

    if (quickShapeRef.current) {
      scheduleRender();
      return;
    }

    currentStrokePointsRef.current.push({ x, y });

    const pts = currentStrokePointsRef.current;
    const prev = pts[pts.length - 2];
    const dx = x - prev.x;
    const dy = y - prev.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < QS.holdTolerance) {
      scheduleQuickShape(x, y);
    } else {
      clearHoldTimer();
    }

    // Send live points to activeStroke for remote preview (throttled inside sendDrawing)
    const strokeColor = tool === 'eraser' ? '#FFFFFF' : brushColor;
    const strokeWidth = tool === 'eraser' ? brushSize * 2 : brushSize;
    onSendDrawing({ type: 'livePoint', points: pts, color: strokeColor, size: strokeWidth });

    scheduleRender();
  };

  const clearCanvas = () => {
    if (!isDrawer || roundStatus !== 'drawing') return;
    const canvas = permanentCanvasRef?.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    onSendDrawing({ type: 'clear' });
  };

  const hint = getWordHint(currentWord, currentPlayerId);

  return (
    <div className={styles.canvasPanel}>
      <div className={styles.wordDisplay}>
        <div className={styles.wordBox}>
          <h3 className={styles.wordTitle}>
            {isDrawer && currentWord ? (
              <>
                <div>✏️ Your word:</div>
                <div className={styles.drawerWord}>{currentWord}</div>
              </>
            ) : (
              <>
                <div>🎨 {currentDrawerName} is drawing...</div>
                <div className={styles.wordHint}>{hint}</div>
              </>
            )}
          </h3>
        </div>
      </div>

      {isDrawer && roundStatus === 'drawing' && (
        <div className={styles.toolsContainer}>
          <div className={styles.colorPalette}>
            {colors.map((color) => (
              <button
                key={color}
                onClick={() => setBrushColor(color)}
                className={`${styles.colorButton} ${brushColor === color ? styles.colorButtonActive : ''}`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <div className={styles.toolButtons}>
            {tool !== 'eraser' ? (
              <button onClick={() => setTool('eraser')} className={styles.toolButton} title="Eraser"><Eraser /></button>
            ) : (
              <button onClick={() => setTool('brush')} className={`${styles.toolButton} ${styles.toolButtonActive}`} title="Brush"><Palette /></button>
            )}
            <button onClick={clearCanvas} className={styles.toolButton}><RotateCcw /></button>
          </div>
          <div className={styles.brushSizeContainer}>
            <span className={styles.brushSizeLabel}>Size:</span>
            <input type="range" min="1" max="20" value={brushSize}
              onChange={(e) => setBrushSize(Number(e.target.value))}
              className={styles.brushSizeSlider} />
            <span className={styles.brushSizeLabel}>{brushSize}px</span>
          </div>
        </div>
      )}

      <div className={styles.canvasContainer}>
        <div className={styles.canvasWrapper}>
          <canvas
            ref={permanentCanvasRef}
            width={600}
            height={400}
            className={styles.canvas}
          />
          <canvas
            ref={remotePreviewCanvasRef}
            width={600}
            height={400}
            className={styles.canvas}
            style={{ pointerEvents: 'none' }}
          />
          <canvas
            ref={previewCanvasRef}
            width={600}
            height={400}
            className={styles.previewCanvas}
            style={{
              touchAction: 'none',
              userSelect: 'none',
              WebkitUserSelect: 'none',
              WebkitTouchCallout: 'none',
              cursor: tool === 'eraser' ? 'cell' : 'crosshair'
            }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endStroke}
            onPointerCancel={endStroke}
          />
        </div>
      </div>
    </div>
  );
});

const ChatPanel = ({
  messages, isDrawer, guessInput, setGuessInput, sendGuess,
  players, isSending, alreadyGuessedCorrectly, myCorrectPoints,
  roundStatus, guessListRef, onInputFocus, onInputBlur
}) => {
  const getScore = (playerId) => players.find(p => p.id === playerId)?.score || 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    sendGuess();
  };

  return (
    <div className={styles.chatPanel}>
      <div className={styles.chatHeader}>
        <h3 className={styles.chatTitle}>Guesses</h3>
      </div>

      <div className={styles.chatMessages} ref={guessListRef}>
        {messages.length === 0 ? (
          <p className={styles.noGuesses}>No guesses yet</p>
        ) : (
          messages.map((msg, i) => (
            <div key={msg.id || i} className={styles.messageContainer}>
              <div className={styles.messageHeader}>
                <span className={styles.messageSender}>{msg.player}</span>
                <span className={styles.messageScore}>{getScore(msg.playerId)} pts</span>
                <span className={styles.messageTime}>{msg.time}</span>
              </div>
              <div className={`${styles.messageContent} ${msg.type === 'correct' ? styles.correctGuess : styles.wrongGuess}`}>
                {msg.type === 'correct' ? (
                  <span>{msg.message} <span className={styles.pointsBadge}>+{msg.points}</span></span>
                ) : (
                  msg.message
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <div className={styles.guessInputContainer}>
        {isDrawer ? (
          <div className={styles.drawerMessage} />
        ) : alreadyGuessedCorrectly ? (
          <div className={styles.alreadyCorrect}>
            ✅ You guessed correctly! <span className={styles.pointsBadge}>+{myCorrectPoints}</span>
          </div>
        ) : roundStatus !== 'drawing' ? (
          <div className={styles.waitingInput}>Waiting for round to start...</div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.guessForm}>
            <input
              type="text"
              value={guessInput}
              onChange={(e) => setGuessInput(e.target.value)}
              onFocus={onInputFocus}
              onBlur={onInputBlur}
              placeholder="Type your guess..."
              className={styles.guessInput}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
              disabled={isSending}
            />
            <button
              type="submit"
              className={styles.guessButton}
              disabled={isSending || !guessInput.trim()}
            >
              <Send size={18} />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

const Toast = ({ message, type }) => {
  const icon = type === 'success' ? <CheckCircle size={20} /> : type === 'info' ? <Trophy size={20} /> : <XCircle size={20} />;
  return (
    <div className={`${styles.toast} ${styles[`toast${type.charAt(0).toUpperCase() + type.slice(1)}`]}`}>
      {icon}
      <span>{message}</span>
    </div>
  );
};

export default DrawingGame;
