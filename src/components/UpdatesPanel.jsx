import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { typeLabel, statusLabel } from '../lib/api';

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function UpdatesPanel({ updates, unreadCount, lastChecked, onMarkRead, onRefresh }) {
  const [open, setOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function handleOpen() {
    setOpen(v => !v);
    if (!open && unreadCount > 0) onMarkRead();
  }

  async function handleRefresh(e) {
    e.stopPropagation();
    setRefreshing(true);
    await onRefresh();
    setRefreshing(false);
  }

  return (
    <div ref={ref} className="relative">
      <button onClick={handleOpen}
        className="relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-ink-800 border border-ink-600 hover:border-crimson-600/40 transition-all">
        <svg className="w-4 h-4 text-ash-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        <span className="text-xs text-ash-400 hidden sm:inline font-mono">UPDATES</span>
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] bg-crimson-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-1 animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-ink-800 border border-ink-600 rounded-xl shadow-2xl z-50 overflow-hidden animate-fade-in">
          <div className="flex items-center justify-between px-4 py-3 border-b border-ink-700">
            <div>
              <span className="text-sm font-medium text-ash-100">Latest Updates</span>
              {lastChecked && (
                <p className="text-xs text-ash-500 mt-0.5">Checked {timeAgo(lastChecked)}</p>
              )}
            </div>
            <button onClick={handleRefresh}
              className={`w-7 h-7 flex items-center justify-center rounded-lg bg-ink-700 text-ash-400 hover:text-ash-200 transition-colors ${refreshing ? 'animate-spin' : ''}`}>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>

          <div className="overflow-y-auto max-h-96">
            {updates.length === 0 ? (
              <div className="py-8 text-center text-ash-500 text-sm">No updates yet</div>
            ) : (
              updates.map((manga, i) => (
                <Link key={manga.id} to={`/manga/${manga.hid}`} onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-ink-700 transition-colors border-b border-ink-700/50 last:border-0">
                  <div className="w-9 h-12 rounded bg-ink-600 shrink-0 overflow-hidden">
                    {manga.poster
                      ? <img src={manga.poster} alt="" className="w-full h-full object-cover" loading="lazy" />
                      : <div className="w-full h-full flex items-center justify-center"><span className="text-ink-400 font-display text-sm">M</span></div>
                    }
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-ash-100 truncate leading-snug">{manga.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {manga.latestChapter && (
                        <span className="text-xs text-crimson-400 font-mono">Ch.{manga.latestChapter}</span>
                      )}
                      <span className="text-xs text-ash-500">{typeLabel(manga.type)}</span>
                    </div>
                  </div>
                  {i < unreadCount && (
                    <div className="w-1.5 h-1.5 rounded-full bg-crimson-500 shrink-0" />
                  )}
                </Link>
              ))
            )}
          </div>

          <div className="border-t border-ink-700 px-4 py-2.5 flex items-center justify-between">
            <span className="text-xs text-ash-500">Auto-refresh every 3 min</span>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs text-green-400 font-mono">LIVE</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
