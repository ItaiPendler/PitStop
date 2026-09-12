import { HashRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { AppShell } from './AppShell';
import { AboutPage } from '../pages/About';
import { AddEditFuelingPage } from '../pages/AddEditFueling';
import { DashboardPage } from '../pages/Dashboard';
import { OnboardingPage } from '../pages/Onboarding';
import { SettingsPage } from '../pages/Settings';
import { StatisticsPage } from '../pages/Statistics';
import { useAuth } from '../auth';
import { useSheet } from '../sheet';

// Gates the data-driven pages behind "signed in AND a sheet is connected" —
// per spec.md §9/§15, no data is ever shown without a live session, so a
// stored sheet id alone isn't enough. About/Settings/Onboarding stay
// reachable regardless (spec.md §8 screen 1).
const RequireSheet = () => {
  const { status } = useAuth();
  const { sheet } = useSheet();
  return status === 'signed-in' && sheet ? <Outlet /> : <Navigate replace to="/onboarding" />;
};

export const AppRouter = () => (
  <HashRouter>
    <Routes>
      <Route path="/onboarding" element={<OnboardingPage />} />
      <Route element={<AppShell />}>
        <Route element={<RequireSheet />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/add" element={<AddEditFuelingPage />} />
          <Route path="/stats" element={<StatisticsPage />} />
        </Route>
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/about" element={<AboutPage />} />
      </Route>
    </Routes>
  </HashRouter>
);
