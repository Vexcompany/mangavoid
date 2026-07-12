import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { searchManga } from '../lib/api';
import MangaCard from '../components/MangaCard';
import { CardSkeleton } from '../components/Skeleton';

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const q = searchParams.get('q') || '';

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!q) return;
    setLoading(true);
    setError(null);
    setResults([]);

    searchManga(q, 12)
      .then(data => setResults(data))
      .catch(() => setError('Failed to fetch results. Please try again.'))
      .finally(() => setLoading(false));
  }, [q]);

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 animate-fade-in">
      <div className="mb-8">
        <div className="flex items-baseline gap-3">
          <h2 className="font-display text-3xl tracking-wider text-ash-100">RESULTS</h2>
          <span className="text-ash-500 font-mono text-sm">"{q}"</span>
        </div>
        {!loading && results.length > 0 && (
          <p className="text-ash-500 text-sm mt-1">{results.length} titles found</p>
        )}
      </div>

      {error && (
        <div className="bg-crimson-600/10 border border-crimson-600/30 rounded-lg p-4 text-crimson-300 text-sm">
          {error}
        </div>
      )}

      {!error && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {loading
            ? Array.from({ length: 12 }).map((_, i) => <CardSkeleton key={i} />)
            : results.map(manga => <MangaCard key={manga.id || manga.hid} manga={manga} />)
          }
        </div>
      )}

      {!loading && !error && results.length === 0 && q && (
        <div className="text-center py-24">
          <div className="font-display text-6xl text-ink-600 mb-4">404</div>
          <p className="text-ash-500 mb-6">No titles found for "{q}"</p>
          <Link to="/" className="text-crimson-400 hover:text-crimson-300 text-sm border border-crimson-600/30 rounded-full px-4 py-2 transition-colors">
            Back to Home
          </Link>
        </div>
      )}
    </main>
  );
}
