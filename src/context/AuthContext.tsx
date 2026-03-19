import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { runQuery, getRows, saveDb } from '@/db/database';

interface UserStats {
  total_score: number;
  games_played: number;
  best_score: number;
}

interface AuthContextType {
  currentUser: string | null;
  userStats: UserStats | null;
  register: (username: string, password: string) => Promise<void>;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  saveGameResult: (score: number) => Promise<void>;
  refreshStats: () => void;
}

const SESSION_KEY = 'treasure_session';

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function loadStats(username: string): UserStats | null {
  const rows = getRows<UserStats>(
    'SELECT total_score, games_played, best_score FROM users WHERE username = ?',
    [username]
  );
  return rows[0] ?? null;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<string | null>(
    () => localStorage.getItem(SESSION_KEY)
  );
  const [userStats, setUserStats] = useState<UserStats | null>(() => {
    const saved = localStorage.getItem(SESSION_KEY);
    if (!saved) return null;
    try {
      return loadStats(saved);
    } catch {
      return null;
    }
  });

  const refreshStats = useCallback(() => {
    if (!currentUser) return;
    setUserStats(loadStats(currentUser));
  }, [currentUser]);

  const register = useCallback(async (username: string, password: string) => {
    if (!username.trim()) throw new Error('Username is required');
    if (!password) throw new Error('Password is required');

    const existing = getRows('SELECT id FROM users WHERE username = ?', [username]);
    if (existing.length > 0) throw new Error('Username already taken');

    const hash = await hashPassword(password);
    runQuery(
      'INSERT INTO users (username, password_hash) VALUES (?, ?)',
      [username, hash]
    );
    saveDb();

    localStorage.setItem(SESSION_KEY, username);
    setCurrentUser(username);
    setUserStats({ total_score: 0, games_played: 0, best_score: 0 });
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const rows = getRows<{ password_hash: string }>(
      'SELECT password_hash FROM users WHERE username = ?',
      [username]
    );
    if (rows.length === 0) throw new Error('User not found');

    const hash = await hashPassword(password);
    if (rows[0].password_hash !== hash) throw new Error('Wrong password');

    localStorage.setItem(SESSION_KEY, username);
    setCurrentUser(username);
    setUserStats(loadStats(username));
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    setCurrentUser(null);
    setUserStats(null);
  }, []);

  const saveGameResult = useCallback(async (score: number) => {
    if (!currentUser) return;
    runQuery(
      `UPDATE users
       SET games_played = games_played + 1,
           total_score  = total_score + ?,
           best_score   = CASE WHEN ? > best_score THEN ? ELSE best_score END
       WHERE username = ?`,
      [score, score, score, currentUser]
    );
    saveDb();
    setUserStats(loadStats(currentUser));
  }, [currentUser]);

  return (
    <AuthContext.Provider value={{ currentUser, userStats, register, login, logout, saveGameResult, refreshStats }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
