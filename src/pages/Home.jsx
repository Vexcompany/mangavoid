import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchManga } from '../lib/api';
import MangaCard from '../components/MangaCard';
import { CardSkeleton } from '../components/Skeleton';

const TRENDING_QUERIES = ['One Piece', 'Jujutsu Kaisen', 'Chainsaw Man', 'Solo Leveling', 'Berserk', 'Vinland Saga'];

export default function Home() {
  const [input, setInput] = useState('');
  const [trending, setTrending] = useState([]);
  const [loadingTrending, setLoadingTrending] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    searchManga('action adventure', 12)
      .then(data => setTrending(data))
      .catch(() => setTrending([]))
      .finally(() => setLoadingTrending(false));
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    if (input.trim()) navigate(`/search?q=${encodeURIComponent(input.trim())}`);
  }

  return (
    <main className="min-h-screen">
      <section className="relative flex flex-col items-center justify-center text-center px-4 py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(224,25,47,0.08),transparent)]" />
        <div className="absolute inset-0 grid-bg opacity-20" />

        <div className="relative z-10 max-w-2xl w-full">
          <div className="inline-flex items-center gap-2 bg-crimson-600/10 border border-crimson-600/20 rounded-full px-4 py-1 mb-6">
            <div className="w-1.5 h-1.5 rounded-full bg-crimson-400 animate-pulse" />
            <span className="text-xs font-mono text-crimson-300 tracking-widest uppercase">Manga Database</span>
          </div>

          <h1 className="font-display text-6xl md:text-8xl tracking-wider leading-none mb-4">
            <span className="text-ash-100">READ THE</span>
            <br />
            <span className="text-gradient">VOID.</span>
          </h1>

          <p className="text-ash-400 text-base md:text-lg max-w-md mx-auto mb-10 leading-relaxed">
            Explore millions of manga, manhwa, and manhua titles. Find your next obsession.
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
            <button
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-crimson-600 hover:bg-crimson-500 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors crimson-glow"
            >
              Search
            </button>
          </form>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs text-ash-500 font-mono">QUICK SEARCH:</span>
            {TRENDING_QUERIES.map(t => (
              <button
                key={t}
                onClick={() => navigate(`/search?q=${encodeURIComponent(t)}`)}
                className="text-xs text-ash-400 hover:text-crimson-300 border border-ink-600 hover:border-crimson-600/40 rounded-full px-3 py-1 transition-all bg-ink-800/50 hover:bg-crimson-600/5"
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 pb-16">
        <div className="border-t border-ink-700 pt-10 mb-6 flex items-baseline gap-3">
          <h2 className="font-display text-2xl tracking-wider text-ash-100">DISCOVER</h2>
          <span className="text-xs font-mono text-ash-500">popular titles</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {loadingTrending
            ? Array.from({ length: 12 }).map((_, i) => <CardSkeleton key={i} />)
            : trending.map(manga => <MangaCard key={manga.id || manga.hid} manga={manga} />)
          }
        </div>
      </section>
    </main>
  );
}
