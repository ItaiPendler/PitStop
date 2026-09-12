import type { ReactNode } from 'react';
import { Home, Info, LineChart, Settings } from 'lucide-react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { BottomNav, Button, Chip, TopBar } from '../components';
import type { NavItem } from '../components';
import { useAuth } from '../auth';

const AuthControl = () => {
  const { signIn, signOut, status } = useAuth();

  if (status === 'signed-in') {
    return (
      <button onClick={() => void signOut()} type="button">
        <Chip status="optimal">מחובר</Chip>
      </button>
    );
  }

  return (
    <Button
      className="min-h-9 px-3 text-xs"
      disabled={status === 'signing-in'}
      onClick={() => void signIn()}
      variant="secondary"
    >
      {status === 'signing-in' ? 'מתחבר…' : 'התחברות'}
    </Button>
  );
};

const PAGE_TITLES: Record<string, ReactNode> = {
  '/': '🏁 PitStop',
  '/about': 'אודות',
  '/add': 'הוספת תדלוק',
  '/settings': 'הגדרות',
  '/stats': 'סטטיסטיקה',
};

export const AppShell = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isFullScreenPage = location.pathname === '/add';

  const leftItems: NavItem[] = [
    {
      active: location.pathname === '/',
      icon: <Home />,
      key: 'home',
      label: 'בית',
      onClick: () => navigate('/'),
    },
    {
      active: location.pathname === '/stats',
      icon: <LineChart />,
      key: 'stats',
      label: 'סטטיסטיקה',
      onClick: () => navigate('/stats'),
    },
  ];
  const rightItems: NavItem[] = [
    {
      active: location.pathname === '/about',
      icon: <Info />,
      key: 'about',
      label: 'אודות',
      onClick: () => navigate('/about'),
    },
    {
      active: location.pathname === '/settings',
      icon: <Settings />,
      key: 'settings',
      label: 'הגדרות',
      onClick: () => navigate('/settings'),
    },
  ];

  return (
    <div className="mx-auto min-h-svh max-w-[480px]">
      <TopBar end={<AuthControl />} title={PAGE_TITLES[location.pathname] ?? '🏁 PitStop'} />

      <main className={isFullScreenPage ? 'p-4' : 'p-4 pb-20'}>
        <Outlet />
      </main>

      {!isFullScreenPage && (
        <BottomNav
          leftItems={leftItems}
          rightItems={rightItems}
          onFabClick={() => navigate('/add')}
        />
      )}
    </div>
  );
};
