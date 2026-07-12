import { Link } from 'react-router-dom';
import { extractHid, typeLabel, statusLabel } from '../lib/api';

const STATUS_COLOR = {
  1: 'text-green-400 bg-green-400/10',
  2: 'text-blue-400 bg-blue-400/10',
  3: 'text-yellow-400 bg-yellow-400/10',
  4: 'text-ash-400 bg-ash-400/10',
};

export default function MangaCard({ manga }) {
  const hid = extractHid(manga.url);

  return (
    <Link
      to={`/manga/${hid}`}
      className="group block bg-ink-800 rounded-lg overflow-hidden border border-ink-600 card-hover animate-fade-in"
    >
      <div className="relative aspect-[2/3] bg-ink-700 overflow-hidden">
        {manga.poster ? (
          <img
            src={manga.poster}
            alt={manga.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="font-display text-4xl text-ink-500">M</span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <div className="absolute top-2 left-2">
          <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-ink-950/80 text-ash-300 border border-ink-600">
            {typeLabel(manga.type)}
          </span>
        </div>

        {manga.latestChapter && (
          <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span className="text-xs text-ash-300 bg-ink-950/90 px-2 py-1 rounded block truncate">
              Ch. {manga.latestChapter}
            </span>
          </div>
        )}
      </div>

      <div className="p-3">
        <h3 className="text-sm font-medium text-ash-100 leading-snug line-clamp-2 group-hover:text-crimson-300 transition-colors">
          {manga.title}
        </h3>
        <div className="mt-2 flex items-center justify-between">
          <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${STATUS_COLOR[manga.status] || 'text-ash-400 bg-ash-400/10'}`}>
            {statusLabel(manga.status)}
          </span>
          {manga.year && (
            <span className="text-xs text-ash-400 font-mono">{manga.year}</span>
          )}
        </div>
      </div>
    </Link>
  );
}

