import { cloneElement, isValidElement, type ReactNode } from 'react';
import { Plus } from 'lucide-react';
import { cn } from '../lib/cn';

export interface NavItem {
  icon: ReactNode;
  key: string;
  label: string;
  active?: boolean;
  hidden?: boolean;
  onClick?: () => void;
}

export interface BottomNavProps {
  leftItems: NavItem[];
  rightItems: NavItem[];
  fabLabel?: string;
  onFabClick?: () => void;
}

export const BottomNav = ({
  fabLabel = 'הוסף תדלוק',
  leftItems,
  onFabClick,
  rightItems,
}: BottomNavProps) => (
  <nav className="fixed inset-x-0 bottom-0 mx-auto flex h-14 w-full max-w-[480px] border-t border-ghost bg-surface-container-low">
    {leftItems.map((item) => (
      <NavButton key={item.key} item={item} />
    ))}

    <div className="relative flex-1">
      <button
        type="button"
        onClick={onFabClick}
        aria-label={fabLabel}
        className="absolute top-[-22px] left-1/2 flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full border-4 border-surface-container-low bg-primary shadow-glow-amber"
      >
        <Plus aria-hidden className="h-6 w-6 text-on-primary" strokeWidth={2.5} />
      </button>
    </div>

    {rightItems.map((item) => (
      <NavButton key={item.key} item={item} />
    ))}
  </nav>
);

const NavButton = ({ item }: { item: NavItem }) => (
  <button
    type="button"
    onClick={item.onClick}
    disabled={item.hidden}
    className={cn(
      'relative flex flex-1 flex-col items-center justify-center gap-0.5 text-[11px]',
      item.hidden && 'invisible',
      item.active ? 'text-primary' : 'text-on-surface-variant',
    )}
  >
    {item.active && <span className="absolute top-0 h-[3px] w-7 rounded-b-sm bg-primary" />}
    <span className="flex h-[22px] items-center justify-center leading-none">
      {renderNavIcon(item.icon)}
    </span>
    <span>{item.label}</span>
  </button>
);

const renderNavIcon = (icon: ReactNode) => {
  if (
    isValidElement<{
      'aria-hidden'?: boolean;
      className?: string;
      strokeWidth?: number;
    }>(icon)
  ) {
    return cloneElement(icon, {
      'aria-hidden': true,
      className: cn('h-[22px] w-[22px] shrink-0', icon.props.className),
      strokeWidth: icon.props.strokeWidth ?? 1.9,
    });
  }

  return icon;
};
