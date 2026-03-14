import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AuthPage from './components/auth/AuthPage';
import Dashboard from './components/dashboard/Dashboard';
import MapEditor from './components/editor/MapEditor';

type View = { name: 'dashboard' } | { name: 'editor'; mapId: string };

function parseHash(): View {
  const hash = window.location.hash.replace('#', '');
  if (hash.startsWith('/map/')) {
    const mapId = hash.replace('/map/', '').split('?')[0];
    if (mapId) return { name: 'editor', mapId };
  }
  return { name: 'dashboard' };
}

function AppContent() {
  const { user, loading } = useAuth();
  const [view, setView] = useState<View>(parseHash);

  useEffect(() => {
    const onHashChange = () => setView(parseHash());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const navigate = (v: View) => {
    if (v.name === 'dashboard') {
      window.location.hash = '/';
    } else {
      window.location.hash = `/map/${v.name === 'editor' ? v.mapId : ''}`;
    }
    setView(v);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-canvas">
        <div className="w-8 h-8 rounded-full border-2 border-teal border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) return <AuthPage />;

  if (view.name === 'editor') {
    return (
      <MapEditor
        mapId={view.mapId}
        onBack={() => navigate({ name: 'dashboard' })}
      />
    );
  }

  return (
    <Dashboard
      onOpenMap={mapId => navigate({ name: 'editor', mapId })}
    />
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
