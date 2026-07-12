const https = require('https');

function httpsGet(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { 'User-Agent': 'MangaVoid/1.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, body: null }); }
      });
    });
    req.on('error', reject);
    req.setTimeout(15000, () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

function mapManga(manga) {
  const attrs = manga.attributes;
  const coverRel = manga.relationships.find(r => r.type === 'cover_art');
  const coverId = coverRel?.attributes?.fileName;
  const poster = coverId
    ? `/api/cover?url=https://uploads.mangadex.org/covers/${manga.id}/${coverId}.256.jpg`
    : '';
  const title = attrs.title.en || attrs.title.ja || attrs.title['ja-ro'] || Object.values(attrs.title)[0] || 'Unknown';
  const statusMap = { ongoing: 1, completed: 2, hiatus: 3, cancelled: 4 };
  const typeMap = { ja: 1, ko: 2, zh: 3 };
  return {
    id: manga.id, hid: manga.id, title, slug: manga.id,
    type: typeMap[attrs.originalLanguage] || 1,
    status: statusMap[attrs.status] || 0,
    poster, url: `https://mangadex.org/title/${manga.id}`,
    year: attrs.year, latestChapter: attrs.lastChapter,
  };
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { mangaId } = req.query;
  if (!mangaId) return res.status(400).json({ error: 'mangaId required' });

  try {
    // Get manga tags first
    const { body: detailBody } = await httpsGet(
      `https://api.mangadex.org/manga/${mangaId}?includes[]=cover_art`
    );
    if (!detailBody?.data) return res.status(200).json({ results: [] });

    const tags = detailBody.data.attributes.tags || [];
    const genreTags = tags.filter(t => t.attributes.group === 'genre').map(t => t.id);
    const originalLang = detailBody.data.attributes.originalLanguage;

    if (genreTags.length === 0) return res.status(200).json({ results: [] });

    const params = new URLSearchParams();
    params.append('limit', '12');
    params.append('includes[]', 'cover_art');
    params.append('contentRating[]', 'safe');
    params.append('contentRating[]', 'suggestive');
    params.append('hasAvailableChapters', 'true');
    params.append('order[followedCount]', 'desc');
    genreTags.slice(0, 3).forEach(id => params.append('includedTags[]', id));
    if (originalLang) params.append('originalLanguage[]', originalLang);

    const { body } = await httpsGet(`https://api.mangadex.org/manga?${params.toString()}`);
    if (!body?.data) return res.status(200).json({ results: [] });

    const results = body.data
      .filter(m => m.id !== mangaId)
      .slice(0, 10)
      .map(mapManga);

    return res.status(200).json({ results });
  } catch (error) {
    console.error('Related error:', error.message);
    return res.status(500).json({ error: error.message });
  }
};
