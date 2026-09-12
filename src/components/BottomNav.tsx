import { cn } from '../lib/cn';

export interface NavItem {
  icon: string;
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
        className="absolute top-[-22px] left-1/2 flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full border-4 border-surface-container-low bg-primary text-2xl font-bold text-on-primary shadow-glow-amber"
      >
        +
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
    <span className="text-xl leading-none">{item.icon}</span>
    <span>{item.label}</span>
  </button>
);
