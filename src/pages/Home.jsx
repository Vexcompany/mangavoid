import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import MangaCard from '../components/MangaCard';
import { CardSkeleton } from '../components/Skeleton';
import { getHistory, getBookmarks } from '../lib/storage';

const QUICK_SEARCHES = ['One Piece', 'Jujutsu Kaisen', 'Chainsaw Man', 'Solo Leveling', 'Berserk', 'Vinland Saga'];
const SORT_OPTIONS = [
  { value: 'followedCount', label: 'Most Followed' },
  { value: 'latestUpload', label: 'Latest Update' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'year', label: 'Newest' },
];
const TYPE_OPTIONS = [
  { value: '', label: 'All Types' },
  { value: 'manga', label: 'Manga' },
  { value: 'manhwa', label: 'Manhwa' },
  { value: 'manhua', label: 'Manhua' },
];
const STATUS_OPTIONS = [
  { value: '', label: 'All Status' },
  { value: 'ongoing', label: 'Ongoing' },
  { value: 'completed', label: 'Completed' },
  { value: 'hiatus', label: 'Hiatus' },
];

export default function Home() {
  const [input, setInput] = useState('');
  const [discover, setDiscover] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tags, setTags] = useState([]);
  const [sort, setSort] = useState('followedCount');
  const [genre, setGenre] = useState('');
  const [status, setStatus] = useState('');
  const [type, setType] = useState('');
  const [tab, setTab] = useState('discover');
  const [history, setHistory] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('/api/tags').then(res => setTags(res.data.tags || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (tab !== 'discover') return;
    setLoading(true);
    const params = { sort };
    if (genre) params.genre = genre;
    if (status) params.status = status;
    if (type) params.type = type;
    axios.get('/api/discover', { params })
      .then(res => setDiscover(res.data.results || []))
      .catch(() => setDiscover([]))
      .finally(() => setLoading(false));
  }, [sort, genre, status, type, tab]);

  useEffect(() => {
    if (tab === 'history') setHistory(getHistory());
    if (tab === 'bookmarks') setBookmarks(getBookmarks());
  }, [tab]);

  function handleSubmit(e) {
    e.preventDefault();
    if (input.trim()) navigate(`/search?q=${encodeURIComponent(input.trim())}`);
  }

  return (
    <main className="min-h-screen">
      <section className="relative flex flex-col items-center justify-center text-center px-4 py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(224,25,47,0.08),transparent)]" />
        <div className="absolute inset-0 grid-bg opacity-20" />
        <div className="relative z-10 max-w-2xl w-full">
          <div className="inline-flex items-center gap-2 bg-crimson-600/10 border border-crimson-600/20 rounded-full px-4 py-1 mb-5">
            <div className="w-1.5 h-1.5 rounded-full bg-crimson-400 animate-pulse" />
            <span className="text-xs font-mono text-crimson-300 tracking-widest uppercase">Manga Database</span>
          </div>
          <h1 className="font-display text-6xl md:text-8xl tracking-wider leading-none mb-4">
            <span className="text-ash-100">READ THE</span><br />
            <span className="text-gradient">VOID.</span>
          </h1>
          <p className="text-ash-400 text-base max-w-md mx-auto mb-8 leading-relaxed">
            Explore millions of manga, manhwa, and manhua titles.
          </p>
          <form onSubmit={handleSubmit} className="relative max-w-lg mx-auto">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Search any title..."
              className="w-full bg-ink-800/80 backdrop-blur border border-ink-600 focus:border-crimson-500 rounded-xl px-5 py-4 text-ash-100 placeholder-ash-500 text-base focus:outline-none focus:ring-2 focus:ring-crimson-500/20 transition-all"
              autoFocus
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 bg-crimson-600 hover:bg-crimson-500 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors">
              Search
            </button>
          </form>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs text-ash-500 font-mono">QUICK:</span>
            {QUICK_SEARCHES.map(t => (
              <button key={t} onClick={() => navigate(`/search?q=${encodeURIComponent(t)}`)}
                className="text-xs text-ash-400 hover:text-crimson-300 border border-ink-600 hover:border-crimson-600/40 rounded-full px-3 py-1 transition-all bg-ink-800/50">
                {t}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 pb-16">
        <div className="border-t border-ink-700 pt-6 mb-6">
          <div className="flex items-center gap-1 mb-6">
            {[
              { key: 'discover', label: 'Discover' },
              { key: 'bookmarks', label: 'Bookmarks' },
              { key: 'history', label: 'History' },
            ].map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`px-4 py-2 text-sm rounded-lg font-medium transition-all ${tab === t.key ? 'bg-crimson-600 text-white' : 'text-ash-400 hover:text-ash-200 hover:bg-ink-800'}`}>
                {t.label}
              </button>
            ))}
          </div>

          {tab === 'discover' && (
            <div className="flex flex-wrap gap-2 mb-6">
              <select value={sort} onChange={e => setSort(e.target.value)}
                className="bg-ink-800 border border-ink-600 rounded-lg px-3 py-1.5 text-sm text-ash-200 focus:outline-none focus:border-crimson-500">
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <select value={genre} onChange={e => setGenre(e.target.value)}
                className="bg-ink-800 border border-ink-600 rounded-lg px-3 py-1.5 text-sm text-ash-200 focus:outline-none focus:border-crimson-500">
                <option value="">All Genres</option>
                {tags.filter(t => t.group === 'genre').map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
              <select value={type} onChange={e => setType(e.target.value)}
                className="bg-ink-800 border border-ink-600 rounded-lg px-3 py-1.5 text-sm text-ash-200 focus:outline-none focus:border-crimson-500">
                {TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <select value={status} onChange={e => setStatus(e.target.value)}
                className="bg-ink-800 border border-ink-600 rounded-lg px-3 py-1.5 text-sm text-ash-200 focus:outline-none focus:border-crimson-500">
                {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              {(genre || type || status) && (
                <button onClick={() => { setGenre(''); setType(''); setStatus(''); }}
                  className="text-xs text-crimson-400 border border-crimson-600/30 rounded-lg px-3 py-1.5 hover:bg-crimson-600/10 transition-all">
                  Clear filters
                </button>
              )}
            </div>
          )}
        </div>

        {tab === 'discover' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {loading
              ? Array.from({ length: 24 }).map((_, i) => <CardSkeleton key={i} />)
              : discover.map(manga => <MangaCard key={manga.id} manga={manga} />)
            }
          </div>
        )}

        {tab === 'bookmarks' && (
          bookmarks.length === 0
            ? <div className="text-center py-20 text-ash-500 text-sm">No bookmarks yet. Tap the bookmark icon on any manga.</div>
            : <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {bookmarks.map(manga => <MangaCard key={manga.id} manga={manga} />)}
              </div>
        )}

        {tab === 'history' && (
          history.length === 0
            ? <div className="text-center py-20 text-ash-500 text-sm">No reading history yet.</div>
            : <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {history.map(manga => <MangaCard key={manga.id} manga={manga} />)}
              </div>
        )}
      </section>
    </main>
  );
}

