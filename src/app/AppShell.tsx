import type { ReactNode } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { BottomNav, TopBar } from '../components'
import type { NavItem } from '../components'

const PAGE_TITLES: Record<string, ReactNode> = {
  '/': '🏁 PitStop',
  '/about': 'אודות',
  '/add': 'הוספת תדלוק',
  '/settings': 'הגדרות',
  '/stats': 'סטטיסטיקה',
}

export const AppShell = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const isFullScreenPage = location.pathname === '/add'

  const leftItems: NavItem[] = [
    { active: location.pathname === '/', icon: '🏠', key: 'home', label: 'בית', onClick: () => navigate('/') },
    {
      active: location.pathname === '/stats',
      icon: '📊',
      key: 'stats',
      label: 'סטטיסטיקה',
      onClick: () => navigate('/stats'),
    },
  ]
  const rightItems: NavItem[] = [
    { hidden: true, icon: '·', key: 'spacer', label: '' },
    {
      active: location.pathname === '/settings',
      icon: '⚙️',
      key: 'settings',
      label: 'הגדרות',
      onClick: () => navigate('/settings'),
    },
  ]

  return (
    <div className="mx-auto min-h-svh max-w-[480px]">
      <TopBar title={PAGE_TITLES[location.pathname] ?? '🏁 PitStop'} />

      <main className={isFullScreenPage ? 'p-4' : 'p-4 pb-20'}>
        <Outlet />
      </main>

      {!isFullScreenPage && (
        <BottomNav leftItems={leftItems} rightItems={rightItems} onFabClick={() => navigate('/add')} />
      )}
    </div>
  )
}
