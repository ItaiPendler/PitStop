import { HashRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { AppShell } from './AppShell';
import { AboutPage } from '../pages/About';
import { AddEditFuelingPage } from '../pages/AddEditFueling';
import { DashboardPage } from '../pages/Dashboard';
import { OnboardingPage } from '../pages/Onboarding';
import { SettingsPage } from '../pages/Settings';
import { StatisticsPage } from '../pages/Statistics';
import { useSheet } from '../sheet';

// Gates the data-driven pages behind "a sheet is connected" — everything
// else (About, Settings, Onboarding) stays reachable regardless, per
// spec.md §8 screen 1.
const RequireSheet = () => {
  const { sheet } = useSheet();
  return sheet ? <Outlet /> : <Navigate replace to="/onboarding" />;
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
