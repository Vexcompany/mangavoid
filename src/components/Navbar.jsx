import { Link } from 'react-router-dom';
import SearchBox from './SearchBox';
import UpdatesPanel from './UpdatesPanel';
import ThemeToggle from './ThemeToggle';
import { useUpdates } from '../hooks/useUpdates';
import { useTheme } from './ThemeToggle';

export default function Navbar() {
  const { updates, unreadCount, lastChecked, markAllRead, refresh } = useUpdates();
  const { theme, toggle } = useTheme();

  return (
    <nav className="sticky top-0 z-50 border-b border-ink-700 bg-ink-950/90 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-4">
        <Link to="/" className="shrink-0">
          <span className="font-display text-2xl tracking-wider text-gradient">MANGAVOID</span>
        </Link>

        <SearchBox className="flex-1 max-w-md" />

        <div className="ml-auto flex items-center gap-2 shrink-0">
          <UpdatesPanel
            updates={updates}
            unreadCount={unreadCount}
            lastChecked={lastChecked}
            onMarkRead={markAllRead}
            onRefresh={refresh}
          />
          <Link to="/stats"
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-ink-800 border border-ink-600 hover:border-crimson-600/40 text-ash-400 hover:text-ash-200 transition-all"
            title="Reading Stats">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </Link>
          <ThemeToggle theme={theme} onToggle={toggle} />
        </div>
      </div>
    </nav>
  );
}
