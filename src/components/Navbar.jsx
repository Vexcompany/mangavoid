import { Link } from 'react-router-dom';
import SearchBox from './SearchBox';
import UpdatesPanel from './UpdatesPanel';
import { useUpdates } from '../hooks/useUpdates';

export default function Navbar() {
  const { updates, unreadCount, lastChecked, markAllRead, refresh } = useUpdates();

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
        </div>
      </div>
    </nav>
  );
}
