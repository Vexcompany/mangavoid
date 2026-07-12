import { Link } from 'react-router-dom';
import SearchBox from './SearchBox';

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-ink-700 bg-ink-950/90 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-6">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <span className="font-display text-2xl tracking-wider text-gradient">MANGAVOID</span>
        </Link>

        <SearchBox className="flex-1 max-w-md" />

        <div className="ml-auto flex items-center gap-1 shrink-0">
          <div className="w-2 h-2 rounded-full bg-crimson-500 animate-pulse" />
          <span className="text-xs font-mono text-ash-400">LIVE</span>
        </div>
      </div>
    </nav>
  );
}

