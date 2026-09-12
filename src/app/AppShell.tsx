import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { BottomNav, Button, Chip, TopBar } from '../components';
import type { NavItem } from '../components';
import { AuthStatus, useAuth } from '../auth';
import { NAV_ROUTES, ROUTES } from './routes';

const AuthControl = () => {
  const { signIn, signOut, status } = useAuth();
  const isSignedIn = status === AuthStatus.SignedIn;
  const isSigningIn = status === AuthStatus.SigningIn;

  return isSignedIn ? (
    <button onClick={() => void signOut()} type="button">
      <Chip status="optimal">מחובר</Chip>
    </button>
  ) : (
    <Button
      className="min-h-9 px-3 text-xs"
      disabled={isSigningIn}
      onClick={() => void signIn()}
      variant="secondary"
    >
      {isSigningIn ? 'מתחבר…' : 'התחברות'}
    </Button>
  );
};

export const AppShell = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isFullScreenPage = location.pathname === ROUTES.add.path;
  const currentTitle =
    location.pathname === ROUTES.add.path
      ? new URLSearchParams(location.search).get('row')
        ? 'עריכת תדלוק'
        : ROUTES.add.title
      : Object.values(ROUTES).find((route) => route.path === location.pathname)?.title;

  const leftItems: NavItem[] = NAV_ROUTES.filter((route) => route.nav?.side === 'left').map(
    (route) => {
      const { icon: Icon, label } = route.nav!;
      return {
        active: location.pathname === route.path,
        icon: <Icon />,
        key: route.id,
        label,
        onClick: () => navigate(route.path),
      };
    },
  );
  const rightItems: NavItem[] = NAV_ROUTES.filter((route) => route.nav?.side === 'right').map(
    (route) => {
      const { icon: Icon, label } = route.nav!;
      return {
        active: location.pathname === route.path,
        icon: <Icon />,
        key: route.id,
        label,
        onClick: () => navigate(route.path),
      };
    },
  );

  return (
    <div className="mx-auto min-h-svh max-w-[480px]">
      <TopBar end={<AuthControl />} title={currentTitle ?? '🏁 PitStop'} />

      <main className={isFullScreenPage ? 'p-4' : 'p-4 pb-20'}>
        <Outlet />
      </main>

      {!isFullScreenPage && (
        <BottomNav
          leftItems={leftItems}
          rightItems={rightItems}
          onFabClick={() => navigate(ROUTES.add.path)}
        />
      )}
    </div>
  );
};
