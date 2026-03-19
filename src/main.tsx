import { createRoot } from 'react-dom/client';
import { StrictMode, useState, useEffect } from 'react';
import App from './App.tsx';
import { AuthProvider } from './context/AuthContext.tsx';
import { initDb } from './db/database.ts';
import './index.css';
import './styles/globals.css';

function Root() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    initDb()
      .then(() => setReady(true))
      .catch((e) => setError(String(e)));
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-amber-50 text-red-700 p-8 text-center">
        <div>
          <p className="text-xl font-bold mb-2">Failed to load database</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-amber-50 to-amber-100">
        <div className="text-amber-700 text-xl animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>
);
