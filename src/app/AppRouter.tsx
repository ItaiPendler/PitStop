import { HashRouter, Route, Routes } from 'react-router-dom';
import { AppShell } from './AppShell';
import { AboutPage } from '../pages/About';
import { AddEditFuelingPage } from '../pages/AddEditFueling';
import { DashboardPage } from '../pages/Dashboard';
import { SettingsPage } from '../pages/Settings';
import { StatisticsPage } from '../pages/Statistics';

export const AppRouter = () => (
  <HashRouter>
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/add" element={<AddEditFuelingPage />} />
        <Route path="/stats" element={<StatisticsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/about" element={<AboutPage />} />
      </Route>
    </Routes>
  </HashRouter>
);
