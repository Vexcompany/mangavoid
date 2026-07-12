import axios from 'axios';

const BASE = import.meta.env.DEV ? '' : '';

export async function searchManga(query, limit = 12) {
  const res = await axios.get(`${BASE}/api/search`, {
    params: { q: query, limit },
  });
  return res.data.results || [];
}

export async function getMangaDetail(hid) {
  const res = await axios.get(`${BASE}/api/detail`, {
    params: { hid },
  });
  return res.data;
}

export function extractHid(url) {
  const match = url.match(/\/title\/([a-z0-9]+)/i);
  return match ? match[1] : url.split('/').pop();
}

export function formatNumber(n) {
  if (!n) return '—';
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n.toString();
}

export function statusLabel(status) {
  const map = { 1: 'Ongoing', 2: 'Completed', 3: 'Hiatus', 4: 'Cancelled' };
  return map[status] || 'Unknown';
}

export function typeLabel(type) {
  const map = { 1: 'Manga', 2: 'Manhwa', 3: 'Manhua', 4: 'Novel', 5: 'One-shot' };
  return map[type] || 'Comic';
}
