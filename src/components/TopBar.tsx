import type { ReactNode } from 'react'

export interface TopBarProps {
  title: ReactNode
  center?: ReactNode
  end?: ReactNode
}

export const TopBar = ({ center, end, title }: TopBarProps) => (
  <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-ghost bg-surface/90 px-4 py-4 backdrop-blur-sm">
    <span className="text-lg font-semibold">{title}</span>
    {center}
    {end}
  </div>
)
