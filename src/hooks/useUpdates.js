import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';

const POLL_INTERVAL = 3 * 60 * 1000; // 3 menit
const STORAGE_KEY = 'mv_last_seen_update';

function getLastSeen() {
  try { return localStorage.getItem(STORAGE_KEY); } catch { return null; }
}
function setLastSeen(ts) {
  try { localStorage.setItem(STORAGE_KEY, ts); } catch {}
}

export function useUpdates() {
  const [updates, setUpdates] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastChecked, setLastChecked] = useState(null);
  const timerRef = useRef(null);
  const isFirstFetch = useRef(true);

  const fetchUpdates = useCallback(async (isSilent = false) => {
    try {
      const lastSeen = getLastSeen();
      const params = { limit: 20 };
      if (lastSeen && !isFirstFetch.current) params.since = lastSeen;

      const res = await axios.get('/api/latest', { params });
      const { results, serverTime } = res.data;

      if (isFirstFetch.current) {
        // First load: just set data, mark all as read
        setUpdates(results);
        setLastSeen(serverTime);
        isFirstFetch.current = false;
        setLastChecked(new Date());
        return;
      }

      if (results.length > 0) {
        setUpdates(prev => {
          const existingIds = new Set(prev.map(m => m.id));
          const fresh = results.filter(m => !existingIds.has(m.id));
          if (fresh.length > 0) {
            setUnreadCount(c => c + fresh.length);
            return [...fresh, ...prev].slice(0, 50);
          }
          return prev;
        });
      }

      setLastSeen(serverTime);
      setLastChecked(new Date());
    } catch (err) {
      console.warn('Update poll failed:', err.message);
    }
  }, []);

  useEffect(() => {
    fetchUpdates(false);
    timerRef.current = setInterval(() => fetchUpdates(true), POLL_INTERVAL);
    return () => clearInterval(timerRef.current);
  }, [fetchUpdates]);

  function markAllRead() {
    setUnreadCount(0);
  }

  return { updates, unreadCount, lastChecked, markAllRead, refresh: () => fetchUpdates(false) };
}
