const HISTORY_KEY = 'mv_history';
const BOOKMARKS_KEY = 'mv_bookmarks';
const PROGRESS_KEY = 'mv_progress';
const PREFS_KEY = 'mv_prefs';

function safeGet(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
  catch { return fallback; }
}

function safeSet(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); }
  catch {}
}

export function getHistory() { return safeGet(HISTORY_KEY, []); }
export function addHistory(manga) {
  const list = getHistory().filter(m => m.hid !== manga.hid);
  list.unshift({ ...manga, visitedAt: Date.now() });
  safeSet(HISTORY_KEY, list.slice(0, 50));
}

export function getBookmarks() { return safeGet(BOOKMARKS_KEY, []); }
export function isBookmarked(hid) { return getBookmarks().some(m => m.hid === hid); }
export function toggleBookmark(manga) {
  const list = getBookmarks();
  const idx = list.findIndex(m => m.hid === manga.hid);
  if (idx >= 0) list.splice(idx, 1);
  else list.unshift({ ...manga, savedAt: Date.now() });
  safeSet(BOOKMARKS_KEY, list);
  return idx < 0;
}

export function getProgress() { return safeGet(PROGRESS_KEY, {}); }
export function saveProgress(mangaHid, chapterId, page, chapterNum) {
  const all = getProgress();
  all[mangaHid] = { chapterId, page, chapterNum, updatedAt: Date.now() };
  safeSet(PROGRESS_KEY, all);
}
export function getProgressFor(mangaHid) {
  return getProgress()[mangaHid] || null;
}

export function getReadChapters(mangaHid) {
  const all = safeGet('mv_read_chapters', {});
  return all[mangaHid] || [];
}
export function markChapterRead(mangaHid, chapterId) {
  const all = safeGet('mv_read_chapters', {});
  if (!all[mangaHid]) all[mangaHid] = [];
  if (!all[mangaHid].includes(chapterId)) all[mangaHid].push(chapterId);
  safeSet('mv_read_chapters', all);
}

export function getPrefs() {
  return safeGet(PREFS_KEY, { mode: 'scroll', direction: 'ltr', fit: 'width' });
}
export function savePrefs(prefs) {
  safeSet(PREFS_KEY, { ...getPrefs(), ...prefs });
}

// Search history
const SEARCH_HISTORY_KEY = 'mv_search_history';
export function getSearchHistory() { return safeGet(SEARCH_HISTORY_KEY, []); }
export function addSearchHistory(query) {
  if (!query?.trim()) return;
  const list = getSearchHistory().filter(q => q !== query.trim());
  list.unshift(query.trim());
  safeSet(SEARCH_HISTORY_KEY, list.slice(0, 10));
}
export function clearSearchHistory() { safeSet(SEARCH_HISTORY_KEY, []); }

// Continue reading — list of manga with progress
export function getContinueReading() {
  const progress = getProgress();
  const history = getHistory();
  return history
    .filter(m => progress[m.hid])
    .map(m => ({ ...m, progress: progress[m.hid] }))
    .slice(0, 6);
}
