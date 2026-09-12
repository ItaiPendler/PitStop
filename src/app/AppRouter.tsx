import { HashRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { AppShell } from './AppShell';
import { AboutPage } from '../pages/About';
import { AddEditFuelingPage } from '../pages/AddEditFueling';
import { AuthStatus, useAuth } from '../auth';
import { DashboardPage } from '../pages/Dashboard';
import { OnboardingPage } from '../pages/Onboarding';
import { SettingsPage } from '../pages/Settings';
import { StatisticsPage } from '../pages/Statistics';
import { ROUTES } from './routes';
import { useSheet } from '../sheet';

// Gates the data-driven pages behind "signed in AND a sheet is connected" —
// per spec.md §9/§15, no data is ever shown without a live session, so a
// stored sheet id alone isn't enough. About/Settings/Onboarding stay
// reachable regardless (spec.md §8 screen 1).
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
          <Route element={<StatisticsPage />} path={ROUTES.stats.path} />
        </Route>
        <Route element={<SettingsPage />} path={ROUTES.settings.path} />
        <Route element={<AboutPage />} path={ROUTES.about.path} />
      </Route>
    </Routes>
  </HashRouter>
);
