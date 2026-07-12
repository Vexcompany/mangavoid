import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getMangaDetail, formatNumber, statusLabel, typeLabel } from '../lib/api';
import { DetailSkeleton } from '../components/Skeleton';
import MangaCard from '../components/MangaCard';
import { isBookmarked, toggleBookmark, addHistory, getProgressFor, getReadChapters } from '../lib/storage';

const STATUS_COLOR = {
  1: 'text-green-400 border-green-400/30 bg-green-400/5',
  2: 'text-blue-400 border-blue-400/30 bg-blue-400/5',
  3: 'text-yellow-400 border-yellow-400/30 bg-yellow-400/5',
  4: 'text-ash-400 border-ash-400/30 bg-ash-400/5',
};

function Badge({ children, className = '' }) {
  return <span className={`inline-block text-xs px-2.5 py-1 rounded-full border font-medium ${className}`}>{children}</span>;
}
function StatItem({ label, value }) {
  return (
    <div className="bg-ink-800 border border-ink-600 rounded-lg p-3 text-center">
      <div className="font-display text-xl tracking-wider text-ash-100">{value}</div>
      <div className="text-xs text-ash-500 font-mono mt-0.5 uppercase tracking-wider">{label}</div>
    </div>
  );
}

function CoverGallery({ mangaId }) {
  const [covers, setCovers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    axios.get('/api/covers', { params: { mangaId } })
      .then(res => setCovers(res.data.covers || []))
      .catch(() => setCovers([]))
      .finally(() => setLoading(false));
  }, [mangaId]);

  if (loading) return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {Array.from({ length: 6 }).map((_, i) => <div key={i} className="w-24 aspect-[2/3] shrink-0 shimmer rounded-lg" />)}
    </div>
  );
  if (covers.length === 0) return null;

  return (
    <>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
        {covers.map(c => (
          <button key={c.id} onClick={() => setLightbox(c)}
            className="shrink-0 w-24 aspect-[2/3] rounded-lg overflow-hidden border border-ink-600 hover:border-crimson-500 transition-all group relative">
            <img src={c.thumb} alt={`Vol.${c.volume}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
            {c.volume && (
              <div className="absolute bottom-0 left-0 right-0 bg-ink-950/80 text-xs text-center py-1 text-ash-400 font-mono">
                Vol.{c.volume}
              </div>
            )}
          </button>
        ))}
      </div>
      {lightbox && (
        <div className="fixed inset-0 z-50 bg-ink-950/95 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setLightbox(null)}>
          <div className="relative max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <img src={lightbox.url} alt="" className="max-h-[85vh] max-w-[90vw] object-contain rounded-xl shadow-2xl" />
            {lightbox.volume && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-ink-950/90 text-xs text-ash-300 px-3 py-1 rounded-full font-mono">
                Volume {lightbox.volume}
              </div>
            )}
            <button onClick={() => setLightbox(null)}
              className="absolute top-3 right-3 w-8 h-8 bg-ink-900/80 rounded-full flex items-center justify-center text-ash-400 hover:text-ash-100 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default function DetailPage() {
  const { hid } = useParams();
  const navigate = useNavigate();
  const [manga, setManga] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [synopsisExpanded, setSynopsisExpanded] = useState(false);
  const [chapters, setChapters] = useState([]);
  const [loadingChapters, setLoadingChapters] = useState(true);
  const [chapterOffset, setChapterOffset] = useState(0);
  const [totalChapters, setTotalChapters] = useState(0);
  const [lang, setLang] = useState('en');
  const [bookmarked, setBookmarked] = useState(false);
  const [readChapters, setReadChapters] = useState([]);
  const [progress, setProgress] = useState(null);
  const [related, setRelated] = useState([]);
  const [activeTab, setActiveTab] = useState('chapters');

  useEffect(() => {
    setLoading(true);
    setManga(null);
    setRelated([]);
    getMangaDetail(hid)
      .then(data => {
        setManga(data);
        setBookmarked(isBookmarked(hid));
        setProgress(getProgressFor(hid));
        setReadChapters(getReadChapters(hid));
        addHistory({ ...data, hid });
        axios.get('/api/related', { params: { mangaId: hid } })
          .then(r => setRelated(r.data.results || [])).catch(() => {});
      })
      .catch(() => setError('Failed to load.'))
      .finally(() => setLoading(false));
  }, [hid]);

  useEffect(() => {
    if (!hid) return;
    setLoadingChapters(true);
    axios.get('/api/chapters', { params: { mangaId: hid, lang, offset: chapterOffset } })
      .then(res => { setChapters(res.data.chapters || []); setTotalChapters(res.data.total || 0); })
      .catch(() => setChapters([]))
      .finally(() => setLoadingChapters(false));
  }, [hid, lang, chapterOffset]);

  function handleBookmark() {
    if (!manga) return;
    setBookmarked(toggleBookmark({ ...manga, hid }));
  }

  if (loading) return <DetailSkeleton />;
  if (error || !manga) return (
    <div className="max-w-6xl mx-auto px-4 py-24 text-center">
      <div className="font-display text-6xl text-ink-600 mb-4">ERR</div>
      <p className="text-ash-500 mb-6">{error}</p>
      <Link to="/" className="text-crimson-400 border border-crimson-600/30 rounded-full px-4 py-2 text-sm">Back</Link>
    </div>
  );

  const synopsis = manga.synopsis || '';
  const shortSynopsis = synopsis.length > 300 ? synopsis.slice(0, 300) + '...' : synopsis;

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 animate-slide-up">
      <Link to="/" className="inline-flex items-center gap-1.5 text-ash-500 hover:text-ash-200 text-sm mb-8 transition-colors">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        Back
      </Link>

      <div className="flex flex-col md:flex-row gap-8 mb-10">
        <div className="shrink-0 w-44 md:w-52 mx-auto md:mx-0">
          <div className="aspect-[2/3] rounded-xl overflow-hidden border border-ink-600 bg-ink-700 crimson-glow">
            {manga.poster
              ? <img src={manga.poster} alt={manga.title} className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center"><span className="font-display text-5xl text-ink-500">M</span></div>
            }
          </div>
          <div className="mt-3 flex flex-col gap-2">
            {progress
              ? <button onClick={() => navigate(`/read/${progress.chapterId}?manga=${hid}&ch=${progress.chapterNum}`)}
                  className="w-full text-center bg-crimson-600 hover:bg-crimson-500 text-white text-sm font-medium py-2.5 rounded-lg transition-colors">
                  Continue Ch.{progress.chapterNum}
                </button>
              : chapters.length > 0 &&
                <button onClick={() => navigate(`/read/${chapters[chapters.length - 1].id}?manga=${hid}&ch=${chapters[chapters.length - 1].chapter}`)}
                  className="w-full text-center bg-crimson-600 hover:bg-crimson-500 text-white text-sm font-medium py-2.5 rounded-lg transition-colors">
                  Start Reading
                </button>
            }
            <button onClick={handleBookmark}
              className={`w-full text-center text-sm font-medium py-2.5 rounded-lg border transition-all flex items-center justify-center gap-2 ${bookmarked ? 'bg-ink-700 border-crimson-600/50 text-crimson-300' : 'bg-ink-800 border-ink-600 text-ash-300 hover:border-crimson-600/40'}`}>
              <svg className="w-4 h-4" fill={bookmarked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              {bookmarked ? 'Bookmarked' : 'Bookmark'}
            </button>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Badge className={STATUS_COLOR[manga.status] || 'text-ash-400 border-ash-400/30'}>{statusLabel(manga.status)}</Badge>
            <Badge className="text-ash-400 border-ink-500 bg-ink-700">{typeLabel(manga.type)}</Badge>
            {manga.year && <Badge className="text-ash-400 border-ink-500 bg-ink-700 font-mono">{manga.year}</Badge>}
          </div>
          <h1 className="font-display text-4xl md:text-5xl tracking-wider text-ash-100 leading-tight mb-1">
            {manga.title.toUpperCase()}
          </h1>
          {manga.altTitles?.length > 0 && (
            <p className="text-ash-500 text-sm mb-4 truncate">{manga.altTitles.slice(0, 2).join(' / ')}</p>
          )}
          <div className="grid grid-cols-3 gap-3 my-5 max-w-sm">
            <StatItem label="Chapter" value={manga.latestChapter || '—'} />
            <StatItem label="Languages" value={manga.languages?.length || '—'} />
            <StatItem label="Year" value={manga.year || '—'} />
          </div>
          {synopsis && (
            <div className="mb-5">
              <h3 className="text-xs font-mono text-ash-500 uppercase tracking-widest mb-2">Synopsis</h3>
              <p className="text-ash-300 text-sm leading-relaxed">{synopsisExpanded ? synopsis : shortSynopsis}</p>
              {synopsis.length > 300 && (
                <button onClick={() => setSynopsisExpanded(v => !v)} className="text-crimson-400 text-xs mt-2 font-medium">
                  {synopsisExpanded ? 'Show less' : 'Read more'}
                </button>
              )}
            </div>
          )}
          {manga.genres?.length > 0 && (
            <div className="mb-4">
              <h3 className="text-xs font-mono text-ash-500 uppercase tracking-widest mb-2">Genres</h3>
              <div className="flex flex-wrap gap-1.5">
                {manga.genres.map(g => <span key={g} className="text-xs px-2.5 py-1 rounded-full bg-ink-700 border border-ink-600 text-ash-300">{g}</span>)}
              </div>
            </div>
          )}
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm border-t border-ink-700 pt-4">
            {manga.authors?.length > 0 && <div><span className="text-xs font-mono text-ash-500 block mb-0.5">AUTHOR</span><span className="text-ash-200">{manga.authors.join(', ')}</span></div>}
            {manga.artists?.length > 0 && <div><span className="text-xs font-mono text-ash-500 block mb-0.5">ARTIST</span><span className="text-ash-200">{manga.artists.join(', ')}</span></div>}
            {manga.demographics?.length > 0 && <div><span className="text-xs font-mono text-ash-500 block mb-0.5">DEMOGRAPHIC</span><span className="text-ash-200">{manga.demographics.join(', ')}</span></div>}
            {manga.themes?.length > 0 && <div><span className="text-xs font-mono text-ash-500 block mb-0.5">THEMES</span><span className="text-ash-200">{manga.themes.slice(0, 4).join(', ')}</span></div>}
          </div>
        </div>
      </div>

      <div className="border-t border-ink-700 pt-8">
        <div className="flex items-center gap-1 mb-6">
          {[
            { key: 'chapters', label: 'Chapters' },
            { key: 'covers', label: 'Covers' },
            { key: 'related', label: 'Related' },
          ].map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className={`px-4 py-2 text-sm rounded-lg font-medium transition-all ${activeTab === t.key ? 'bg-crimson-600 text-white' : 'text-ash-400 hover:text-ash-200 hover:bg-ink-800'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {activeTab === 'chapters' && (
          <>
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <span className="text-xs font-mono text-ash-500">{totalChapters} total</span>
              <select value={lang} onChange={e => { setLang(e.target.value); setChapterOffset(0); }}
                className="bg-ink-800 border border-ink-600 rounded-lg px-3 py-1.5 text-sm text-ash-200 focus:outline-none focus:border-crimson-500">
                <option value="en">English</option>
                <option value="id">Indonesian</option>
                <option value="ja">Japanese</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="pt-br">Portuguese (BR)</option>
              </select>
            </div>
            {loadingChapters
              ? <div className="space-y-2">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-12 shimmer rounded-lg" />)}</div>
              : chapters.length === 0
                ? <div className="text-center py-12 text-ash-500 text-sm">No chapters in this language.</div>
                : (
                  <>
                    <div className="space-y-1.5">
                      {chapters.map(ch => {
                        const isRead = readChapters.includes(ch.id);
                        const isCurrent = progress?.chapterId === ch.id;
                        return (
                          <button key={ch.id} onClick={() => navigate(`/read/${ch.id}?manga=${hid}&ch=${ch.chapter}`)}
                            className={`w-full flex items-center justify-between px-4 py-3 border rounded-lg transition-all group text-left ${isCurrent ? 'bg-crimson-600/10 border-crimson-600/40' : 'bg-ink-800 hover:bg-ink-700 border-ink-600 hover:border-crimson-600/30'}`}>
                            <div className="flex items-center gap-3 min-w-0">
                              <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${isCurrent ? 'bg-crimson-400' : isRead ? 'bg-ash-600' : 'bg-transparent'}`} />
                              <span className={`font-mono text-sm shrink-0 ${isCurrent ? 'text-crimson-400' : isRead ? 'text-ash-500' : 'text-crimson-400'}`}>
                                Ch.{ch.chapter || '?'}
                              </span>
                              <span className={`text-sm truncate ${isRead ? 'text-ash-500' : 'text-ash-300 group-hover:text-ash-100'} transition-colors`}>
                                {ch.title || `Chapter ${ch.chapter}`}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 shrink-0 ml-4">
                              <span className="text-xs text-ash-500 hidden sm:block">{ch.groupName}</span>
                              <span className="text-xs text-ash-500 font-mono">{ch.pages}p</span>
                              <svg className="w-4 h-4 text-ash-600 group-hover:text-crimson-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    {totalChapters > 100 && (
                      <div className="flex items-center justify-center gap-3 mt-6">
                        <button onClick={() => setChapterOffset(Math.max(0, chapterOffset - 100))} disabled={chapterOffset === 0}
                          className="px-4 py-2 text-sm bg-ink-800 border border-ink-600 rounded-lg text-ash-300 disabled:opacity-30 hover:border-crimson-600/40 transition-all">Newer</button>
                        <span className="text-xs font-mono text-ash-500">{chapterOffset + 1}–{Math.min(chapterOffset + 100, totalChapters)} of {totalChapters}</span>
                        <button onClick={() => setChapterOffset(chapterOffset + 100)} disabled={chapterOffset + 100 >= totalChapters}
                          className="px-4 py-2 text-sm bg-ink-800 border border-ink-600 rounded-lg text-ash-300 disabled:opacity-30 hover:border-crimson-600/40 transition-all">Older</button>
                      </div>
                    )}
                  </>
                )
            }
          </>
        )}

        {activeTab === 'covers' && (
          <div>
            <p className="text-xs font-mono text-ash-500 mb-4">Click to enlarge</p>
            <CoverGallery mangaId={hid} />
          </div>
        )}

        {activeTab === 'related' && (
          related.length === 0
            ? <div className="text-center py-12 text-ash-500 text-sm">No related titles found.</div>
            : <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {related.map(m => <MangaCard key={m.id} manga={m} />)}
              </div>
        )}
      </div>
    </main>
  );
}
