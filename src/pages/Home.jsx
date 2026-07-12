import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const TRENDING = ['One Piece', 'Jujutsu Kaisen', 'Chainsaw Man', 'Solo Leveling', 'Berserk', 'Vinland Saga'];

export default function Home() {
  const [input, setInput] = useState('');
  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();
    if (input.trim()) navigate(`/search?q=${encodeURIComponent(input.trim())}`);
  }

  return (
    <main className="min-h-screen">
      <section className="relative flex flex-col items-center justify-center text-center px-4 py-24 md:py-36 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(224,25,47,0.08),transparent)]" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23ffffff\" fill-opacity=\"0.015\"%3E%3Cpath d=\"M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30" />

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
            <span className="text-xs text-ash-500 font-mono">TRENDING:</span>
            {TRENDING.map(t => (
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
        <div className="border-t border-ink-700 pt-12 grid grid-cols-3 md:grid-cols-6 gap-6 text-center">
          {[
            { label: 'Titles', value: '1M+' },
            { label: 'Languages', value: '10+' },
            { label: 'Genres', value: '50+' },
            { label: 'Chapters', value: '50M+' },
            { label: 'Authors', value: '200K+' },
            { label: 'Updated', value: 'Daily' },
          ].map(({ label, value }) => (
            <div key={label}>
              <div className="font-display text-2xl md:text-3xl text-crimson-400 tracking-wider">{value}</div>
              <div className="text-xs text-ash-500 mt-1 font-mono uppercase tracking-widest">{label}</div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
