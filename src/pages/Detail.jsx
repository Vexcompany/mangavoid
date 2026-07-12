import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getMangaDetail, formatNumber, statusLabel, typeLabel } from '../lib/api';
import { DetailSkeleton } from '../components/Skeleton';

const STATUS_COLOR = {
  1: 'text-green-400 border-green-400/30 bg-green-400/5',
  2: 'text-blue-400 border-blue-400/30 bg-blue-400/5',
  3: 'text-yellow-400 border-yellow-400/30 bg-yellow-400/5',
  4: 'text-ash-400 border-ash-400/30 bg-ash-400/5',
};

function Badge({ children, className = '' }) {
  return (
    <span className={`inline-block text-xs px-2.5 py-1 rounded-full border font-medium ${className}`}>
      {children}
    </span>
  );
}

function StatItem({ label, value }) {
  return (
    <div className="bg-ink-800 border border-ink-600 rounded-lg p-3 text-center">
      <div className="font-display text-xl tracking-wider text-ash-100">{value}</div>
      <div className="text-xs text-ash-500 font-mono mt-0.5 uppercase tracking-wider">{label}</div>
    </div>
  );
}

export default function DetailPage() {
  const { hid } = useParams();
  const [manga, setManga] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [synopsisExpanded, setSynopsisExpanded] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(null);
    setManga(null);

    getMangaDetail(hid)
      .then(data => setManga(data))
      .catch(() => setError('Failed to load manga details.'))
      .finally(() => setLoading(false));
  }, [hid]);

  if (loading) return <DetailSkeleton />;

  if (error || !manga) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-24 text-center">
        <div className="font-display text-6xl text-ink-600 mb-4">ERR</div>
        <p className="text-ash-500 mb-6">{error || 'Manga not found.'}</p>
        <Link to="/" className="text-crimson-400 hover:text-crimson-300 text-sm border border-crimson-600/30 rounded-full px-4 py-2 transition-colors">
          Back to Home
        </Link>
      </div>
    );
  }

  const synopsis = manga.synopsis || '';
  const shortSynopsis = synopsis.length > 300 ? synopsis.slice(0, 300) + '...' : synopsis;

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 animate-slide-up">
      <Link to="/" className="inline-flex items-center gap-1.5 text-ash-500 hover:text-ash-200 text-sm mb-8 transition-colors">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </Link>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="shrink-0 w-44 md:w-52 mx-auto md:mx-0">
          <div className="aspect-[2/3] rounded-xl overflow-hidden border border-ink-600 bg-ink-700 crimson-glow">
            {manga.poster ? (
              <img src={manga.poster} alt={manga.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="font-display text-5xl text-ink-500">M</span>
              </div>
            )}
          </div>

          <a
            href={manga.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 block w-full text-center bg-crimson-600 hover:bg-crimson-500 text-white text-sm font-medium py-2.5 rounded-lg transition-colors crimson-glow"
          >
            Read on MangaFire
          </a>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Badge className={STATUS_COLOR[manga.status] || 'text-ash-400 border-ash-400/30'}>
              {statusLabel(manga.status)}
            </Badge>
            <Badge className="text-ash-400 border-ink-500 bg-ink-700">
              {typeLabel(manga.type)}
            </Badge>
            {manga.year && (
              <Badge className="text-ash-400 border-ink-500 bg-ink-700 font-mono">
                {manga.year}
              </Badge>
            )}
          </div>

          <h1 className="font-display text-4xl md:text-5xl tracking-wider text-ash-100 leading-tight mb-1">
            {manga.title.toUpperCase()}
          </h1>

          {manga.altTitles && manga.altTitles.length > 0 && (
            <p className="text-ash-500 text-sm mb-4 truncate">{manga.altTitles.slice(0, 2).join(' / ')}</p>
          )}

          <div className="grid grid-cols-3 gap-3 my-5 max-w-sm">
            <StatItem label="Rating" value={manga.rating ? Number(manga.rating).toFixed(1) : '—'} />
            <StatItem label="Follows" value={formatNumber(manga.follows)} />
            <StatItem label="Chapter" value={manga.latestChapter || '—'} />
          </div>

          {synopsis && (
            <div className="mb-5">
              <h3 className="text-xs font-mono text-ash-500 uppercase tracking-widest mb-2">Synopsis</h3>
              <p className="text-ash-300 text-sm leading-relaxed">
                {synopsisExpanded ? synopsis : shortSynopsis}
              </p>
              {synopsis.length > 300 && (
                <button
                  onClick={() => setSynopsisExpanded(v => !v)}
                  className="text-crimson-400 hover:text-crimson-300 text-xs mt-2 font-medium transition-colors"
                >
                  {synopsisExpanded ? 'Show less' : 'Read more'}
                </button>
              )}
            </div>
          )}

          {manga.genres && manga.genres.length > 0 && (
            <div className="mb-4">
              <h3 className="text-xs font-mono text-ash-500 uppercase tracking-widest mb-2">Genres</h3>
              <div className="flex flex-wrap gap-1.5">
                {manga.genres.map(g => (
                  <span key={g} className="text-xs px-2.5 py-1 rounded-full bg-ink-700 border border-ink-600 text-ash-300">
                    {g}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm mt-4 border-t border-ink-700 pt-4">
            {manga.authors && manga.authors.length > 0 && (
              <div>
                <span className="text-xs font-mono text-ash-500 block mb-0.5">AUTHOR</span>
                <span className="text-ash-200">{manga.authors.join(', ')}</span>
              </div>
            )}
            {manga.artists && manga.artists.length > 0 && (
              <div>
                <span className="text-xs font-mono text-ash-500 block mb-0.5">ARTIST</span>
                <span className="text-ash-200">{manga.artists.join(', ')}</span>
              </div>
            )}
            {manga.demographics && manga.demographics.length > 0 && (
              <div>
                <span className="text-xs font-mono text-ash-500 block mb-0.5">DEMOGRAPHIC</span>
                <span className="text-ash-200">{manga.demographics.join(', ')}</span>
              </div>
            )}
            {manga.themes && manga.themes.length > 0 && (
              <div>
                <span className="text-xs font-mono text-ash-500 block mb-0.5">THEMES</span>
                <span className="text-ash-200">{manga.themes.slice(0, 4).join(', ')}</span>
              </div>
            )}
            {manga.languages && manga.languages.length > 0 && (
              <div>
                <span className="text-xs font-mono text-ash-500 block mb-0.5">LANGUAGES</span>
                <span className="text-ash-200 font-mono text-xs uppercase">{manga.languages.join(', ')}</span>
              </div>
            )}
            {manga.ratingCount && (
              <div>
                <span className="text-xs font-mono text-ash-500 block mb-0.5">RATED BY</span>
                <span className="text-ash-200">{formatNumber(manga.ratingCount)} users</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
