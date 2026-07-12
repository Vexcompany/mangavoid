import { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { saveProgress, markChapterRead, getPrefs, savePrefs } from '../lib/storage';

export default function ReaderPage() {
  const { chapterId } = useParams();
  const [searchParams] = useSearchParams();
  const mangaHid = searchParams.get('manga');
  const chapterNum = searchParams.get('ch');
  const navigate = useNavigate();

  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [navVisible, setNavVisible] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [imgLoaded, setImgLoaded] = useState({});

  const prefs = getPrefs();
  const [mode, setMode] = useState(prefs.mode || 'scroll');
  const [direction, setDirection] = useState(prefs.direction || 'ltr');
  const [fit, setFit] = useState(prefs.fit || 'width');

  const navTimer = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    setPages([]);
    setCurrentPage(0);
    setImgLoaded({});
    axios.get('/api/pages', { params: { chapterId } })
      .then(res => {
        setPages(res.data.pages || []);
        if (mangaHid) {
          markChapterRead(mangaHid, chapterId);
          saveProgress(mangaHid, chapterId, 0, chapterNum);
        }
      })
      .catch(() => setError('Failed to load chapter.'))
      .finally(() => setLoading(false));
  }, [chapterId]);

  useEffect(() => {
    savePrefs({ mode, direction, fit });
  }, [mode, direction, fit]);

  useEffect(() => {
    const show = () => {
      setNavVisible(true);
      clearTimeout(navTimer.current);
      navTimer.current = setTimeout(() => setNavVisible(false), 3000);
    };
    window.addEventListener('mousemove', show);
    window.addEventListener('touchstart', show);
    return () => {
      window.removeEventListener('mousemove', show);
      window.removeEventListener('touchstart', show);
      clearTimeout(navTimer.current);
    };
  }, []);

  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') { setSettingsOpen(false); return; }
      if (mode !== 'paged') return;
      const next = direction === 'rtl' ? 'ArrowLeft' : 'ArrowRight';
      const prev = direction === 'rtl' ? 'ArrowRight' : 'ArrowLeft';
      if (e.key === next || e.key === 'ArrowDown') setCurrentPage(p => Math.min(p + 1, pages.length - 1));
      if (e.key === prev || e.key === 'ArrowUp') setCurrentPage(p => Math.max(p - 1, 0));
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [mode, direction, pages.length]);

  function handlePagedClick(e) {
    const mid = window.innerWidth / 2;
    const goNext = direction === 'rtl' ? e.clientX < mid : e.clientX > mid;
    if (goNext) setCurrentPage(p => Math.min(p + 1, pages.length - 1));
    else setCurrentPage(p => Math.max(p - 1, 0));
  }

  const fitClass = {
    width: 'w-full max-w-3xl',
    height: 'max-h-screen max-w-full',
    original: '',
  }[fit] || 'w-full max-w-3xl';

  if (loading) return (
    <div className="min-h-screen bg-ink-950 flex flex-col items-center justify-center gap-4">
      <div className="w-10 h-10 border-2 border-crimson-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-ash-500 text-sm font-mono">Loading chapter...</p>
    </div>
  );

  if (error || pages.length === 0) return (
    <div className="min-h-screen bg-ink-950 flex flex-col items-center justify-center gap-4">
      <div className="font-display text-5xl text-ink-600">ERR</div>
      <p className="text-ash-500 text-sm">{error || 'No pages found.'}</p>
      <button onClick={() => navigate(-1)} className="text-crimson-400 border border-crimson-600/30 rounded-full px-4 py-2 text-sm">Go Back</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0d0d0d] relative">
      <div className={`fixed top-0 left-0 right-0 z-50 bg-ink-950/95 backdrop-blur border-b border-ink-700 transition-all duration-300 ${navVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full'}`}>
        <div className="max-w-4xl mx-auto px-4 h-12 flex items-center justify-between gap-3">
          <button onClick={() => navigate(mangaHid ? `/manga/${mangaHid}` : -1)}
            className="flex items-center gap-1.5 text-ash-400 hover:text-ash-100 transition-colors text-sm shrink-0">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            <span className="hidden sm:inline">Back</span>
          </button>

          {chapterNum && <span className="text-xs font-mono text-ash-500 shrink-0">Chapter {chapterNum}</span>}

          <div className="flex items-center gap-2 ml-auto">
            <div className="flex items-center gap-1 bg-ink-800 rounded-lg p-0.5 border border-ink-600">
              {['scroll', 'paged'].map(m => (
                <button key={m} onClick={() => setMode(m)}
                  className={`text-xs px-2.5 py-1 rounded-md transition-all capitalize ${mode === m ? 'bg-crimson-600 text-white' : 'text-ash-400 hover:text-ash-200'}`}>
                  {m}
                </button>
              ))}
            </div>
            <button onClick={() => setSettingsOpen(v => !v)}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-ink-800 border border-ink-600 text-ash-400 hover:text-ash-200 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </button>
            <span className="text-xs font-mono text-ash-500 shrink-0">
              {mode === 'paged' ? `${currentPage + 1}/${pages.length}` : `${pages.length}p`}
            </span>
          </div>
        </div>

        {mode === 'scroll' && (
          <div className="h-0.5 bg-ink-700">
            <div className="h-full bg-crimson-500 transition-all duration-300"
              style={{ width: `${Object.keys(imgLoaded).length / pages.length * 100}%` }} />
          </div>
        )}
      </div>

      {settingsOpen && (
        <div className="fixed top-14 right-4 z-50 bg-ink-800 border border-ink-600 rounded-xl p-4 w-56 shadow-2xl animate-fade-in">
          <p className="text-xs font-mono text-ash-500 uppercase tracking-widest mb-3">Settings</p>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-ash-400 mb-1.5">Direction</p>
              <div className="flex gap-1">
                {[['ltr', 'L→R'], ['rtl', 'R←L']].map(([val, label]) => (
                  <button key={val} onClick={() => setDirection(val)}
                    className={`flex-1 text-xs py-1.5 rounded-lg border transition-all ${direction === val ? 'bg-crimson-600 border-crimson-500 text-white' : 'border-ink-600 text-ash-400 hover:border-crimson-600/40'}`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-ash-400 mb-1.5">Fit</p>
              <div className="flex gap-1">
                {[['width', 'Width'], ['height', 'Height'], ['original', 'Original']].map(([val, label]) => (
                  <button key={val} onClick={() => setFit(val)}
                    className={`flex-1 text-xs py-1.5 rounded-lg border transition-all ${fit === val ? 'bg-crimson-600 border-crimson-500 text-white' : 'border-ink-600 text-ash-400 hover:border-crimson-600/40'}`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="pt-12">
        {mode === 'scroll' ? (
          <div className="flex flex-col items-center">
            {pages.map((page, i) => (
              <img key={i} src={page.url} alt={`Page ${i + 1}`}
                className={`block ${fitClass}`}
                loading={i < 3 ? 'eager' : 'lazy'}
                onLoad={() => setImgLoaded(prev => ({ ...prev, [i]: true }))}
              />
            ))}
            <div className="py-8 text-center">
              <p className="text-ash-500 text-sm font-mono mb-4">End of chapter</p>
              <button onClick={() => navigate(mangaHid ? `/manga/${mangaHid}` : -1)}
                className="text-crimson-400 border border-crimson-600/30 rounded-full px-5 py-2 text-sm hover:bg-crimson-600/10 transition-all">
                Back to chapters
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[calc(100vh-3rem)] cursor-pointer select-none"
            onClick={handlePagedClick}>
            {pages[currentPage] && (
              <img src={pages[currentPage].url} alt={`Page ${currentPage + 1}`}
                className={`object-contain ${fit === 'width' ? 'w-full max-w-3xl' : fit === 'height' ? 'max-h-[calc(100vh-5rem)]' : ''}`}
                loading="eager"
              />
            )}
            <div className={`fixed bottom-0 left-0 right-0 h-1 bg-ink-800 transition-opacity duration-300 ${navVisible ? 'opacity-100' : 'opacity-0'}`}>
              <div className="h-full bg-crimson-500 transition-all"
                style={{ width: `${(currentPage + 1) / pages.length * 100}%` }} />
            </div>
            {currentPage === pages.length - 1 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="bg-ink-900/90 rounded-xl p-6 text-center pointer-events-auto" onClick={e => e.stopPropagation()}>
                  <p className="text-ash-400 text-sm mb-4">End of chapter</p>
                  <button onClick={() => navigate(mangaHid ? `/manga/${mangaHid}` : -1)}
                    className="text-crimson-400 border border-crimson-600/30 rounded-full px-5 py-2 text-sm hover:bg-crimson-600/10 transition-all">
                    Back to chapters
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

