import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { useAuth } from './context/AuthContext';
import AuthPage from './components/AuthPage';
import SeaLife from './components/SeaLife';
import keyImage from './assets/key.png';
import closedChest from './assets/treasure_closed.png';
import treasureChest from './assets/treasure_opened.png';
import skeletonChest from './assets/treasure_opened_skeleton.png';
import chestOpenSound from './audios/chest_open.mp3';
import evilLaughSound from './audios/chest_open_with_evil_laugh.mp3';

interface Box {
  id: number;
  isOpen: boolean;
  hasTreasure: boolean;
}

const ROMAN = ['I', 'II', 'III', 'IV', 'V'];

const BUBBLES = [
  { left: '4%',  size: 10, dur: 16, delay: 0   },
  { left: '12%', size: 7,  dur: 21, delay: 3.5 },
  { left: '22%', size: 14, dur: 13, delay: 7   },
  { left: '32%', size: 9,  dur: 19, delay: 1   },
  { left: '44%', size: 6,  dur: 17, delay: 10  },
  { left: '54%', size: 13, dur: 14, delay: 4   },
  { left: '65%', size: 8,  dur: 23, delay: 8   },
  { left: '74%', size: 17, dur: 12, delay: 2   },
  { left: '84%', size: 10, dur: 18, delay: 6   },
  { left: '93%', size: 12, dur: 20, delay: 9   },
];

const LIGHT_SHAFTS = [
  { left: '10%', dur: '12s', delay: '0s'  },
  { left: '30%', dur: '16s', delay: '-5s' },
  { left: '58%', dur: '13s', delay: '-9s' },
  { left: '80%', dur: '17s', delay: '-3s' },
];

export default function App() {
  const { currentUser, userStats, logout, saveGameResult } = useAuth();
  const [boxes, setBoxes] = useState<Box[]>([]);
  const [score, setScore] = useState(0);
  const [gameEnded, setGameEnded] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const scoreSavedRef = useRef(false);

  const initializeGame = () => {
    const totalBoxes = 5;
    const treasureCount = Math.random() < 0.5 ? 1 : 2;
    const treasureIndices = new Set<number>();
    while (treasureIndices.size < treasureCount) {
      treasureIndices.add(Math.floor(Math.random() * totalBoxes));
    }
    const newBoxes: Box[] = Array.from({ length: totalBoxes }, (_, index) => ({
      id: index,
      isOpen: false,
      hasTreasure: treasureIndices.has(index),
    }));
    setBoxes(newBoxes);
    setScore(0);
    setGameEnded(false);
    scoreSavedRef.current = false;
  };

  useEffect(() => { initializeGame(); }, []);

  // Save result once when game ends (only for logged-in users)
  useEffect(() => {
    if (gameEnded && currentUser && !scoreSavedRef.current) {
      scoreSavedRef.current = true;
      saveGameResult(score);
    }
  }, [gameEnded, score, currentUser, saveGameResult]);

  const openBox = (boxId: number) => {
    if (gameEnded) return;
    const box = boxes.find(b => b.id === boxId);
    if (box && !box.isOpen) {
      new Audio(box.hasTreasure ? chestOpenSound : evilLaughSound).play();
    }
    setBoxes(prevBoxes => {
      const updatedBoxes = prevBoxes.map(box => {
        if (box.id === boxId && !box.isOpen) {
          const newScore = box.hasTreasure ? score + 100 : score - 50;
          setScore(newScore);
          return { ...box, isOpen: true };
        }
        return box;
      });
      const allOpened = updatedBoxes.every(box => box.isOpen);
      if (allOpened) setGameEnded(true);
      return updatedBoxes;
    });
  };

  // Full-page swap — must be after all hooks
  if (showAuth) {
    return <AuthPage onClose={() => setShowAuth(false)} />;
  }

  return (
    <div className="ocean-page flex flex-col items-center" style={{ padding: '0 2rem 220px' }}>

      {/* ── Layer 0: Caustic light shafts ── */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 1 }}>
        {LIGHT_SHAFTS.map((s, i) => (
          <div
            key={i}
            className="ocean-light-shaft"
            style={{ left: s.left, animationDuration: s.dur, animationDelay: s.delay }}
          />
        ))}
      </div>

      {/* ── Sea life: fish + jellyfish ── */}
      <SeaLife />

      {/* ── Layer 1: Floating bubbles ── */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 2 }}>
        {BUBBLES.map((b, i) => (
          <div
            key={i}
            className="bubble"
            style={{ left: b.left, width: b.size, height: b.size, animationDuration: `${b.dur}s`, animationDelay: `${b.delay}s` }}
          />
        ))}
      </div>

      {/* ── Layer 2: Elaborate seabed ── */}
      <div className="fixed bottom-0 left-0 right-0 pointer-events-none overflow-hidden" style={{ zIndex: 3, height: '200px' }}>
        <svg viewBox="0 0 1440 200" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style={{ width: '100%', height: '100%', display: 'block' }}>
          {/* Rock layers */}
          <path d="M0,100 C180,75 360,115 540,90 C720,65 900,105 1080,82 C1200,68 1340,96 1440,86 L1440,200 L0,200 Z" fill="rgba(6,24,52,0.55)"/>
          <path d="M0,128 C240,105 480,140 720,118 C900,102 1140,132 1440,120 L1440,200 L0,200 Z" fill="rgba(4,14,38,0.72)"/>
          <path d="M0,155 C360,135 720,165 1080,148 C1240,140 1360,158 1440,152 L1440,200 L0,200 Z" fill="rgba(2,8,24,0.88)"/>

          {/* ── Left coral (red) ── */}
          <g stroke-linecap="round" fill="none">
            <path d="M85,155 C84,137 83,122 82,108" stroke="rgba(239,68,68,0.42)" stroke-width="3.5"/>
            <path d="M82,108 C76,96 70,88 65,82" stroke="rgba(239,68,68,0.38)" stroke-width="3"/>
            <path d="M82,108 C88,96 94,88 98,82" stroke="rgba(239,68,68,0.38)" stroke-width="3"/>
            <path d="M82,126 C75,115 69,110 63,106" stroke="rgba(239,68,68,0.32)" stroke-width="2.5"/>
            <path d="M82,126 C89,115 95,110 100,106" stroke="rgba(239,68,68,0.32)" stroke-width="2.5"/>
            <path d="M65,82 C61,74 59,68 58,62" stroke="rgba(239,68,68,0.3)" stroke-width="2"/>
            <path d="M98,82 C102,74 104,68 105,62" stroke="rgba(239,68,68,0.3)" stroke-width="2"/>
          </g>

          {/* ── Left seaweed ── */}
          <path d="M185,155 C180,138 190,122 183,106 C176,90 186,76 181,62 C176,50 184,40 179,28" stroke="rgba(4,110,82,0.65)" stroke-width="5" fill="none" stroke-linecap="round"/>
          <path d="M210,155 C216,136 206,120 213,104 C220,88 210,74 216,60 C222,48 213,37 219,25" stroke="rgba(4,110,82,0.52)" stroke-width="3.5" fill="none" stroke-linecap="round"/>

          {/* ── Rock cluster left-center ── */}
          <ellipse cx="360" cy="158" rx="38" ry="16" fill="rgba(12,28,60,0.65)"/>
          <ellipse cx="382" cy="152" rx="24" ry="13" fill="rgba(16,36,72,0.58)"/>
          <ellipse cx="342" cy="156" rx="18" ry="10" fill="rgba(10,22,50,0.62)"/>

          {/* ── Center seaweed ── */}
          <path d="M690,155 C685,136 695,120 688,103 C681,87 691,72 685,57 C679,45 688,34 682,22" stroke="rgba(4,110,82,0.55)" stroke-width="4.5" fill="none" stroke-linecap="round"/>
          <path d="M715,155 C721,136 711,120 717,103 C723,86 713,71 719,56 C725,44 716,33 721,21" stroke="rgba(4,110,82,0.42)" stroke-width="3" fill="none" stroke-linecap="round"/>

          {/* ── Starfish ── */}
          <polygon points="490,162 492,170 500,170 494,175 496,183 490,178 484,183 486,175 480,170 488,170" fill="rgba(251,113,133,0.38)"/>

          {/* ── Pebbles ── */}
          <circle cx="560" cy="168" r="5" fill="rgba(14,32,65,0.6)"/>
          <circle cx="572" cy="171" r="3.5" fill="rgba(18,40,78,0.52)"/>
          <circle cx="870" cy="166" r="6" fill="rgba(11,26,56,0.58)"/>
          <circle cx="882" cy="170" r="4" fill="rgba(15,34,68,0.5)"/>

          {/* ── Right seaweed ── */}
          <path d="M1155,155 C1150,136 1160,120 1153,103 C1146,87 1156,72 1150,57 C1144,45 1153,34 1147,22" stroke="rgba(4,110,82,0.52)" stroke-width="4" fill="none" stroke-linecap="round"/>
          <path d="M1178,155 C1184,136 1174,120 1180,103 C1186,86 1176,71 1182,56 C1188,44 1179,33 1184,21" stroke="rgba(4,110,82,0.4)" stroke-width="3" fill="none" stroke-linecap="round"/>

          {/* ── Right coral (orange) ── */}
          <g stroke-linecap="round" fill="none">
            <path d="M1295,155 C1296,138 1297,123 1298,109" stroke="rgba(251,146,60,0.42)" stroke-width="3.5"/>
            <path d="M1298,109 C1292,97 1286,89 1281,83" stroke="rgba(251,146,60,0.38)" stroke-width="3"/>
            <path d="M1298,109 C1304,97 1310,89 1315,83" stroke="rgba(251,146,60,0.38)" stroke-width="3"/>
            <path d="M1298,128 C1291,116 1285,111 1280,107" stroke="rgba(251,146,60,0.32)" stroke-width="2.5"/>
            <path d="M1298,128 C1305,116 1311,111 1316,107" stroke="rgba(251,146,60,0.32)" stroke-width="2.5"/>
            <path d="M1281,83 C1277,75 1275,69 1274,63" stroke="rgba(251,146,60,0.28)" stroke-width="2"/>
            <path d="M1315,83 C1319,75 1321,69 1322,63" stroke="rgba(251,146,60,0.28)" stroke-width="2"/>
          </g>

          {/* ── Rock cluster right ── */}
          <ellipse cx="1080" cy="157" rx="32" ry="14" fill="rgba(12,28,60,0.62)"/>
          <ellipse cx="1098" cy="152" rx="20" ry="11" fill="rgba(16,36,72,0.55)"/>
        </svg>
      </div>

      {/* ── Header: logged-in ── */}
      {currentUser ? (
        <div
          className="ocean-header flex items-center justify-between px-6 py-3 mb-8"
          style={{ width: 'calc(100% + 4rem)', marginLeft: '-2rem', marginRight: '-2rem', zIndex: 40, position: 'sticky', top: 0 }}
        >
          <span className="ocean-text-primary font-bold" style={{ fontSize: '0.9375rem' }}>🤿 {currentUser}</span>
          {userStats && (
            <div className="flex gap-3">
              <span className="ocean-stat-badge">🎮 <strong>{userStats.games_played}</strong></span>
              <span className="ocean-stat-badge">
                💎 <strong className={userStats.total_score >= 0 ? 'ocean-text-win' : 'ocean-text-lose'} style={{ fontWeight: 'bold' }}>${userStats.total_score}</strong>
              </span>
              <span className="ocean-stat-badge">🏆 <strong className="ocean-text-win" style={{ fontWeight: 'bold' }}>${userStats.best_score}</strong></span>
            </div>
          )}
          <button onClick={logout} className="ocean-btn-danger px-4 py-2 text-sm">🚪 Logout</button>
        </div>
      ) : (
        /* Guest: pulsing CTA pill */
        <div className="fixed top-5 right-5" style={{ zIndex: 50 }}>
          <button onClick={() => setShowAuth(true)} className="ocean-cta">
            🌊 Login / Register
          </button>
        </div>
      )}

      {/* Auth page (full page swap) */}
      {showAuth && <AuthPage onClose={() => setShowAuth(false)} />}

      {/* ── Game content ── */}
      <div className="relative flex flex-col items-center flex-1 w-full" style={{ zIndex: 10, paddingTop: currentUser ? '0' : '4rem' }}>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="ocean-title font-bold mb-3" style={{ fontSize: '2.5rem', lineHeight: 1.2 }}>
            🌊 Deep Sea Treasure Hunt 🌊
          </h1>
          <p className="ocean-text-secondary mb-2" style={{ fontSize: '1rem' }}>
            Dive deep and open the sunken chests to find treasure!
          </p>
          <p className="ocean-text-muted text-sm">
            💎 Treasure: +$100 &nbsp;·&nbsp; 🦑 Kraken: -$50
            {!currentUser && (
              <span className="ocean-text-faint" style={{ marginLeft: '0.5rem' }}>(Login to save your stats)</span>
            )}
          </p>
        </div>

        {/* Score row: score panel + porthole */}
        <div className="mb-8 flex items-center gap-6">
          <div className="ocean-score-display">
            <div className="ocean-score-label">Current Score</div>
            <div className={`ocean-score-value ${score >= 0 ? 'ocean-text-win' : 'ocean-text-lose'}`}>
              ${score}
            </div>
          </div>

          <div className="ocean-porthole">
            {gameEnded ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.4 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.45, ease: 'backOut' }}
                className="text-center"
              >
                {score > 0 ? (
                  <><div style={{ fontSize: '2.25rem' }}>🏆</div><div className="ocean-text-win" style={{ fontSize: '1.1rem' }}>Win!</div></>
                ) : score === 0 ? (
                  <><div style={{ fontSize: '2.25rem' }}>🤝</div><div className="ocean-text-tie" style={{ fontSize: '1.1rem' }}>Tie!</div></>
                ) : (
                  <><div style={{ fontSize: '2.25rem' }}>🦑</div><div className="ocean-text-lose" style={{ fontSize: '1.1rem' }}>Lose!</div></>
                )}
              </motion.div>
            ) : (
              <div className="ocean-text-faint font-bold" style={{ fontSize: '2.5rem' }}>?</div>
            )}
          </div>
        </div>

        {/* Chest row */}
        <div className="flex flex-row justify-center gap-4 mb-8 w-full" style={{ maxWidth: '900px' }}>
          {boxes.map((box) => (
            <motion.div
              key={box.id}
              className="ocean-chest-card flex flex-col items-center"
              style={{ cursor: box.isOpen ? 'default' : `url(${keyImage}) 8 8, pointer`, width: '160px', flexShrink: 0 }}
              whileHover={{ scale: box.isOpen ? 1 : 1.03 }}
              whileTap={{ scale: box.isOpen ? 1 : 0.96 }}
              onClick={() => openBox(box.id)}
            >
              {/* Chest number */}
              <div className="ocean-chest-label">Chest {ROMAN[box.id]}</div>

              {/* Chest image */}
              <div className="relative flex items-center justify-center" style={{ width: '120px', height: '120px', padding: '0.5rem 0' }}>
                {!box.isOpen && <div className="ocean-chest-pulse" />}
                <motion.img
                  src={box.isOpen ? (box.hasTreasure ? treasureChest : skeletonChest) : closedChest}
                  alt={box.isOpen ? (box.hasTreasure ? 'Treasure!' : 'Sea Monster!') : 'Sunken Chest'}
                  className={`object-contain drop-shadow-lg ${!box.isOpen ? 'ocean-chest-closed' : ''}`}
                  style={{ width: '100%', height: '100%' }}
                  initial={{ scale: 1, opacity: 1 }}
                  animate={{ scale: box.isOpen ? 1.08 : 1, opacity: 1 }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                />
                {box.isOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.35 }}
                    className="absolute"
                    style={{ top: '-1rem', left: '50%', transform: 'translateX(-50%)', zIndex: 20, whiteSpace: 'nowrap' }}
                  >
                    {box.hasTreasure
                      ? <div className="text-xl animate-bounce">✨💎✨</div>
                      : <div className="text-xl animate-pulse">🦑👻🦑</div>}
                  </motion.div>
                )}
              </div>

              {/* Score badge / click hint */}
              <div className="text-center" style={{ marginTop: '0.25rem', marginBottom: '0.75rem', minHeight: '2rem', display: 'flex', alignItems: 'center' }}>
                {box.isOpen ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.75 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3, duration: 0.3 }}
                    className={box.hasTreasure ? 'ocean-result-treasure' : 'ocean-result-skeleton'}
                  >
                    {box.hasTreasure ? '+$100' : '-$50'}
                  </motion.div>
                ) : (
                  <div className="ocean-text-faint text-sm">Click to open</div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Game over */}
        {gameEnded && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center w-full"
            style={{ maxWidth: '32rem', margin: '0 auto' }}
          >
            <div className="ocean-gameover">
              <h2 className="ocean-text-primary font-bold mb-2" style={{ fontSize: '1.625rem' }}>
                {score > 0 ? '🎉 Victory!' : score === 0 ? '🤝 A Tie!' : '💀 Defeated!'}
              </h2>
              <p className="ocean-text-secondary" style={{ fontSize: '1.125rem' }}>
                Final Score:{' '}
                <span className={score >= 0 ? 'ocean-text-win' : 'ocean-text-lose'}>
                  ${score}
                </span>
              </p>
              <p className="ocean-text-muted text-sm" style={{ marginTop: '0.5rem' }}>
                {boxes.some(box => box.isOpen && box.hasTreasure)
                  ? 'Treasure found! Well done, deep sea diver! 🎉'
                  : 'The kraken got you! Better luck next dive! 🦑'}
              </p>
            </div>
            <button
              onClick={initializeGame}
              className="ocean-btn rounded-xl"
              style={{ fontSize: '1.125rem', padding: '1rem 3rem' }}
            >
              🌊 Dive Again
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
