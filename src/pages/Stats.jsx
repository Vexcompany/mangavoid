import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getHistory, getProgress, getReadChapters, getBookmarks } from '../lib/storage';
import { typeLabel, statusLabel } from '../lib/api';

function StatCard({ label, value, sub, accent = false }) {
  return (
    <div className={`rounded-xl border p-5 ${accent ? 'bg-crimson-600/10 border-crimson-600/30' : 'bg-ink-800 border-ink-600'}`}>
      <div className={`font-display text-4xl tracking-wider mb-1 ${accent ? 'text-crimson-400' : 'text-ash-100'}`}>{value}</div>
      <div className="text-sm text-ash-300 font-medium">{label}</div>
      {sub && <div className="text-xs text-ash-500 mt-1">{sub}</div>}
    </div>
  );
}

function MiniBar({ label, count, max }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-ash-400 w-24 truncate shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-ink-700 rounded-full overflow-hidden">
        <div className="h-full bg-crimson-500 rounded-full transition-all duration-700"
          style={{ width: `${max > 0 ? (count / max) * 100 : 0}%` }} />
      </div>
      <span className="text-xs font-mono text-ash-500 w-6 text-right shrink-0">{count}</span>
    </div>
  );
}

export default function StatsPage() {
  const history = getHistory();
  const progress = getProgress();
  const bookmarks = getBookmarks();

  const stats = useMemo(() => {
    const totalRead = history.length;
    const inProgress = Object.keys(progress).length;
    const bookmarkCount = bookmarks.length;

    // Count chapters read
    let totalChapters = 0;
    try {
      const raw = JSON.parse(localStorage.getItem('mv_read_chapters') || '{}');
      Object.values(raw).forEach(arr => { totalChapters += arr.length; });
    } catch {}

    // Type breakdown
    const typeCount = {};
    history.forEach(m => {
      const t = typeLabel(m.type);
      typeCount[t] = (typeCount[t] || 0) + 1;
    });

    // Status breakdown
    const statusCount = {};
    history.forEach(m => {
      const s = statusLabel(m.status);
      statusCount[s] = (statusCount[s] || 0) + 1;
    });

    // Most recent
    const recent = [...history].slice(0, 5);

    // Estimate reading time (avg 3 min/chapter)
    const readingMins = totalChapters * 3;
    const readingHours = Math.floor(readingMins / 60);

    return { totalRead, inProgress, bookmarkCount, totalChapters, typeCount, statusCount, recent, readingHours, readingMins };
  }, []);

  const maxType = Math.max(...Object.values(stats.typeCount), 1);
  const maxStatus = Math.max(...Object.values(stats.statusCount), 1);

  return (
    <main className="max-w-3xl mx-auto px-4 py-10 animate-slide-up">
      <Link to="/" className="inline-flex items-center gap-1.5 text-ash-500 hover:text-ash-200 text-sm mb-8 transition-colors">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        Back
      </Link>

      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-crimson-600/10 border border-crimson-600/20 rounded-full px-4 py-1 mb-3">
          <span className="text-xs font-mono text-crimson-300 tracking-widest uppercase">Your Stats</span>
        </div>
        <h1 className="font-display text-5xl tracking-wider text-ash-100">READING STATS</h1>
        <p className="text-ash-500 text-sm mt-2">Based on your local reading history</p>
      </div>

      {stats.totalRead === 0 ? (
        <div className="text-center py-20">
          <div className="font-display text-5xl text-ink-600 mb-4">EMPTY</div>
          <p className="text-ash-500 text-sm mb-6">Start reading to see your stats here.</p>
          <Link to="/" className="text-crimson-400 border border-crimson-600/30 rounded-full px-5 py-2 text-sm hover:bg-crimson-600/10 transition-all">
            Discover manga
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Titles Explored" value={stats.totalRead} accent />
            <StatCard label="Chapters Read" value={stats.totalChapters} />
            <StatCard label="In Progress" value={stats.inProgress} />
            <StatCard label="Bookmarked" value={stats.bookmarkCount} />
          </div>

          {stats.readingHours > 0 && (
            <div className="bg-ink-800 border border-ink-600 rounded-xl p-5">
              <p className="text-xs font-mono text-ash-500 uppercase tracking-widest mb-2">Estimated Reading Time</p>
              <div className="flex items-baseline gap-2">
                <span className="font-display text-4xl text-ash-100 tracking-wider">
                  {stats.readingHours > 0 ? `${stats.readingHours}h` : `${stats.readingMins}m`}
                </span>
                <span className="text-ash-500 text-sm">spent reading manga</span>
              </div>
              <p className="text-xs text-ash-600 mt-1">Based on avg 3 min/chapter</p>
            </div>
          )}

          {Object.keys(stats.typeCount).length > 0 && (
            <div className="bg-ink-800 border border-ink-600 rounded-xl p-5">
              <p className="text-xs font-mono text-ash-500 uppercase tracking-widest mb-4">Format Breakdown</p>
              <div className="space-y-3">
                {Object.entries(stats.typeCount).sort((a, b) => b[1] - a[1]).map(([type, count]) => (
                  <MiniBar key={type} label={type} count={count} max={maxType} />
                ))}
              </div>
            </div>
          )}

          {Object.keys(stats.statusCount).length > 0 && (
            <div className="bg-ink-800 border border-ink-600 rounded-xl p-5">
              <p className="text-xs font-mono text-ash-500 uppercase tracking-widest mb-4">By Status</p>
              <div className="space-y-3">
                {Object.entries(stats.statusCount).sort((a, b) => b[1] - a[1]).map(([s, count]) => (
                  <MiniBar key={s} label={s} count={count} max={maxStatus} />
                ))}
              </div>
            </div>
          )}

          {stats.recent.length > 0 && (
            <div className="bg-ink-800 border border-ink-600 rounded-xl p-5">
              <p className="text-xs font-mono text-ash-500 uppercase tracking-widest mb-4">Recently Explored</p>
              <div className="space-y-3">
                {stats.recent.map(manga => (
                  <Link key={manga.id} to={`/manga/${manga.hid}`}
                    className="flex items-center gap-3 hover:bg-ink-700 -mx-2 px-2 py-1.5 rounded-lg transition-colors">
                    <div className="w-8 h-11 rounded bg-ink-600 overflow-hidden shrink-0">
                      {manga.poster
                        ? <img src={manga.poster} alt="" className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center"><span className="font-display text-xs text-ink-400">M</span></div>
                      }
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-ash-200 truncate">{manga.title}</p>
                      <p className="text-xs text-ash-500">{typeLabel(manga.type)} · {statusLabel(manga.status)}</p>
                    </div>
                    <svg className="w-4 h-4 text-ash-600 shrink-0 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
