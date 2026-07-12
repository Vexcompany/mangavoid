const https = require('https');

function httpsGet(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { 'User-Agent': 'MangaVoid/1.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch (e) { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on('error', reject);
    req.setTimeout(15000, () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { q, limit = 12 } = req.query;
  if (!q) return res.status(400).json({ error: 'Query required' });

  try {
    const params = new URLSearchParams();
    params.append('title', q);
    params.append('limit', String(parseInt(limit)));
    params.append('order[relevance]', 'desc');
    params.append('includes[]', 'cover_art');
    params.append('contentRating[]', 'safe');
    params.append('contentRating[]', 'suggestive');

    const url = `https://api.mangadex.org/manga?${params.toString()}`;
    const { status, body } = await httpsGet(url);

    if (status !== 200 || !body.data) {
      return res.status(200).json({ results: [] });
    }

    const results = body.data.map(manga => {
      const attrs = manga.attributes;
      const coverRel = manga.relationships.find(r => r.type === 'cover_art');
      const coverId = coverRel?.attributes?.fileName;
      const poster = coverId
        ? `https://uploads.mangadex.org/covers/${manga.id}/${coverId}.256.jpg`
        : '';

      const title =
        attrs.title.en ||
        attrs.title.ja ||
        attrs.title['ja-ro'] ||
        Object.values(attrs.title)[0] ||
        'Unknown';

      const latestChapter = attrs.lastChapter || null;
      const status = { ongoing: 1, completed: 2, hiatus: 3, cancelled: 4 }[attrs.status] || 0;
      const type = { manga: 1, manhwa: 2, manhua: 3, novel: 4, 'one_shot': 5 }[attrs.originalLanguage === 'ko' ? 'manhwa' : attrs.originalLanguage === 'zh' ? 'manhua' : 'manga'] || 1;

      return {
        id: manga.id,
        hid: manga.id,
        title,
        slug: manga.id,
        type,
        status,
        poster,
        url: `https://mangadex.org/title/${manga.id}`,
        year: attrs.year,
        latestChapter,
      };
    });

    return res.status(200).json({ results });
  } catch (error) {
    console.error('Search error:', error.message);
    return res.status(500).json({ error: error.message });
  }
};
