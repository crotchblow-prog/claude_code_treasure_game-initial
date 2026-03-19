import { useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '@/context/AuthContext';
import SeaLife from '@/components/SeaLife';

interface AuthPageProps {
  onClose: () => void;
}

const BUBBLES = [
  { left: '6%',  size: 10, dur: 16, delay: 0   },
  { left: '18%', size: 7,  dur: 21, delay: 4   },
  { left: '34%', size: 13, dur: 14, delay: 7   },
  { left: '52%', size: 8,  dur: 19, delay: 1.5 },
  { left: '68%', size: 11, dur: 17, delay: 5   },
  { left: '82%', size: 15, dur: 13, delay: 9   },
  { left: '93%', size: 9,  dur: 22, delay: 3   },
];

const LIGHT_SHAFTS = [
  { left: '15%', dur: '13s', delay: '0s'  },
  { left: '55%', dur: '17s', delay: '-6s' },
  { left: '80%', dur: '14s', delay: '-3s' },
];

export default function AuthPage({ onClose }: AuthPageProps) {
  const { register, login } = useAuth();
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (tab === 'register') {
        await register(username.trim(), password);
      } else {
        await login(username.trim(), password);
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  function switchTab(t: 'login' | 'register') {
    setTab(t);
    setError('');
    setUsername('');
    setPassword('');
  }

  return (
    <div className="ocean-page" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>

      {/* Sea life */}
      <SeaLife />

      {/* Caustic light shafts */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 1 }}>
        {LIGHT_SHAFTS.map((s, i) => (
          <div key={i} className="ocean-light-shaft" style={{ left: s.left, animationDuration: s.dur, animationDelay: s.delay }} />
        ))}
      </div>

      {/* Bubbles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 2 }}>
        {BUBBLES.map((b, i) => (
          <div key={i} className="bubble" style={{ left: b.left, width: b.size, height: b.size, animationDuration: `${b.dur}s`, animationDelay: `${b.delay}s` }} />
        ))}
      </div>

      {/* Back to game button */}
      <div style={{ position: 'fixed', top: '1.25rem', left: '1.5rem', zIndex: 20 }}>
        <button
          onClick={onClose}
          className="ocean-btn"
          style={{ borderRadius: '9999px', padding: '0.5rem 1.125rem', fontSize: '0.875rem', gap: '0.375rem' }}
        >
          ← Play as Guest
        </button>
      </div>

      {/* Centered card */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '5rem 1rem 2rem', position: 'relative', zIndex: 10 }}>
        <motion.div
          initial={{ opacity: 0, y: 28, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.28, ease: 'easeOut' }}
          className="ocean-modal"
        >
          {/* Header */}
          <div className="ocean-modal-header">
            <div style={{ fontSize: '3.5rem', marginBottom: '0.5rem' }}>🌊</div>
            <h2 className="font-bold tracking-wide" style={{ color: 'white', fontSize: '1.625rem' }}>
              {tab === 'login' ? 'Welcome Back, Diver!' : 'Dive In!'}
            </h2>
            <p className="ocean-text-muted text-sm" style={{ marginTop: '0.375rem' }}>
              {tab === 'login' ? 'Login to track your treasure' : 'Create an account to save your score'}
            </p>
          </div>

          {/* Tab switcher */}
          <div className="ocean-tabs">
            {(['login', 'register'] as const).map(t => (
              <button
                key={t}
                onClick={() => switchTab(t)}
                className={`ocean-tab ${tab === t ? 'ocean-tab-active' : 'ocean-tab-inactive'}`}
              >
                {t === 'login' ? '🌊 Login' : '⚓ Register'}
              </button>
            ))}
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            style={{ padding: '1.625rem 2rem 2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}
          >
            {/* Username */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <label className="ocean-text-label" htmlFor="auth-username">Diver Name</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', fontSize: '1rem' }}>🤿</span>
                <input
                  id="auth-username"
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="Your diver name"
                  className="ocean-input"
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <label className="ocean-text-label" htmlFor="auth-password">Password</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', fontSize: '1rem' }}>🔑</span>
                <input
                  id="auth-password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Secret passphrase"
                  className="ocean-input"
                  autoComplete={tab === 'register' ? 'new-password' : 'current-password'}
                  required
                />
              </div>
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="ocean-error">
                    <span>⚠️</span>
                    <span>{error}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <button type="submit" disabled={loading} className="ocean-submit">
              {loading ? '⏳ Please wait...' : tab === 'login' ? '🌊 Dive In!' : '⚓ Join the Crew!'}
            </button>

            {/* Switch hint */}
            <p className="text-center ocean-text-hint">
              {tab === 'login' ? 'New here? ' : 'Already diving? '}
              <button
                type="button"
                onClick={() => switchTab(tab === 'login' ? 'register' : 'login')}
                className="ocean-text-link"
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                {tab === 'login' ? 'Create an account' : 'Login instead'}
              </button>
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
