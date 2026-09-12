import { Suspense, lazy } from 'react';
import { HashRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { AppShell } from './AppShell';
import { AboutPage } from '../pages/About';
import { AddEditFuelingPage } from '../pages/AddEditFueling';
import { AuthStatus, useAuth } from '../auth';
import { DashboardPage } from '../pages/Dashboard';
import { OnboardingPage } from '../pages/Onboarding';
import { SettingsPage } from '../pages/Settings';
import { ROUTES } from './routes';
import { useSheet } from '../sheet';

const StatisticsPage = lazy(async () => {
  const module = await import('../pages/Statistics');
  return { default: module.StatisticsPage };
});

const RequireSheet = () => {
  const { status } = useAuth();
  const { sheet } = useSheet();
  return status === AuthStatus.SignedIn && sheet ? (
    <Outlet />
  ) : (
    <Navigate replace to={ROUTES.onboarding.path} />
  );
};

export const AppRouter = () => (
  <HashRouter>
    <Routes>
      <Route element={<OnboardingPage />} path={ROUTES.onboarding.path} />
      <Route element={<AppShell />}>
        <Route element={<RequireSheet />}>
          <Route element={<DashboardPage />} path={ROUTES.home.path} />
          <Route element={<AddEditFuelingPage />} path={ROUTES.add.path} />
          <Route
            element={
              <Suspense
                fallback={
                  <div className="flex flex-1 items-center justify-center py-16">
                    <p className="text-sm text-on-surface-variant">טוען סטטיסטיקה…</p>
                  </div>
                }
              >
                <StatisticsPage />
              </Suspense>
            }
            path={ROUTES.stats.path}
          />
        </Route>
        <Route element={<SettingsPage />} path={ROUTES.settings.path} />
        <Route element={<AboutPage />} path={ROUTES.about.path} />
      </Route>
    </Routes>
  </HashRouter>
);
