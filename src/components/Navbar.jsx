import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function Navbar() {
  const [input, setInput] = useState('');
  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();
    if (input.trim()) {
      navigate(`/search?q=${encodeURIComponent(input.trim())}`);
    }
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-ink-700 bg-ink-950/90 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-6">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <span className="font-display text-2xl tracking-wider text-gradient">MANGAVOID</span>
        </Link>

        <form onSubmit={handleSubmit} className="flex-1 max-w-md">
          <div className="relative">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Search manga, manhwa..."
              className="w-full bg-ink-800 border border-ink-600 rounded-md px-4 py-1.5 text-sm text-ash-200 placeholder-ash-400 focus:outline-none focus:border-crimson-500 focus:ring-1 focus:ring-crimson-500/30 transition-all"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-ash-400 hover:text-crimson-400 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </form>

        <div className="ml-auto flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-crimson-500 animate-pulse"></div>
          <span className="text-xs font-mono text-ash-400">LIVE</span>
        </div>
      </div>
    </nav>
  );
}
