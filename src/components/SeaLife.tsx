const FISH = [
  { emoji: '🐠', top: '8%',  size: 24, dur: 20, delay:   0, dir: 'left'  },
  { emoji: '🐟', top: '20%', size: 19, dur: 27, delay:  -9, dir: 'right' },
  { emoji: '🐠', top: '33%', size: 22, dur: 23, delay:  -4, dir: 'left'  },
  { emoji: '🐡', top: '47%', size: 25, dur: 35, delay: -16, dir: 'right' },
  { emoji: '🦈', top: '38%', size: 40, dur: 55, delay: -30, dir: 'left'  },
  { emoji: '🐟', top: '56%', size: 17, dur: 21, delay:  -7, dir: 'left'  },
  { emoji: '🐢', top: '63%', size: 30, dur: 46, delay: -22, dir: 'right' },
  { emoji: '🐠', top: '25%', size: 20, dur: 29, delay: -13, dir: 'right' },
  { emoji: '🐟', top: '14%', size: 15, dur: 18, delay: -11, dir: 'left'  },
  { emoji: '🦑', top: '42%', size: 22, dur: 32, delay: -19, dir: 'right' },
];

const JELLYFISH = [
  { emoji: '🪼', top: '12%', left: '5%',  size: 36, dur: 7,  delay:  0 },
  { emoji: '🪼', top: '40%', left: '90%', size: 28, dur: 9,  delay: -3 },
  { emoji: '🪼', top: '26%', left: '80%', size: 22, dur: 6,  delay: -5 },
  { emoji: '🪼', top: '58%', left: '11%', size: 26, dur: 8,  delay: -2 },
];

export default function SeaLife() {
  return (
    <>
      {/* Swimming fish */}
      {FISH.map((f, i) => (
        <div
          key={`fish-${i}`}
          className="ocean-fish"
          style={{
            top: f.top,
            fontSize: f.size,
            animationName: f.dir === 'left' ? 'fish-swim-left' : 'fish-swim-right',
            animationDuration: `${f.dur}s`,
            animationDelay: `${f.delay}s`,
            transform: f.dir === 'right' ? 'scaleX(-1)' : 'none',
          }}
        >
          {f.emoji}
        </div>
      ))}

      {/* Bobbing jellyfish */}
      {JELLYFISH.map((j, i) => (
        <div
          key={`jelly-${i}`}
          className="ocean-jellyfish"
          style={{
            top: j.top,
            left: j.left,
            fontSize: j.size,
            animationDuration: `${j.dur}s`,
            animationDelay: `${j.delay}s`,
          }}
        >
          {j.emoji}
        </div>
      ))}
    </>
  );
}
