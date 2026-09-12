import type { LucideIcon } from 'lucide-react';
import { Home, Info, LineChart, Settings } from 'lucide-react';

export type RouteId = 'about' | 'add' | 'home' | 'onboarding' | 'settings' | 'stats';

export interface RouteEntry {
  id: RouteId;
  path: string;
  title: string;
  fullScreen?: boolean;
  nav?: { icon: LucideIcon; label: string; side: 'left' | 'right' };
}

export const ROUTES: Record<RouteId, RouteEntry> = {
  about: {
    id: 'about',
    nav: { icon: Info, label: 'אודות', side: 'right' },
    path: '/about',
    title: 'אודות',
  },
  add: {
    fullScreen: true,
    id: 'add',
    path: '/add',
    title: 'הוספת תדלוק',
  },
  home: {
    id: 'home',
    nav: { icon: Home, label: 'בית', side: 'left' },
    path: '/',
    title: '🏁 PitStop',
  },
  onboarding: {
    id: 'onboarding',
    path: '/onboarding',
    title: 'PitStop',
  },
  settings: {
    id: 'settings',
    nav: { icon: Settings, label: 'הגדרות', side: 'right' },
    path: '/settings',
    title: 'הגדרות',
  },
  stats: {
    id: 'stats',
    nav: { icon: LineChart, label: 'סטטיסטיקה', side: 'left' },
    path: '/stats',
    title: 'סטטיסטיקה',
  },
};

export const NAV_ROUTES: RouteEntry[] = Object.values(ROUTES).filter((route) => route.nav);
