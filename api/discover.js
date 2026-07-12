const https = require('https');

function httpsGet(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { 'User-Agent': 'MangaVoid/1.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, body: data }); }
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

  const { sort = 'followedCount', genre, status, type, offset = 0 } = req.query;

  try {
    const params = new URLSearchParams();
    params.append('limit', '100');
    params.append('offset', String(parseInt(offset)));
    params.append('includes[]', 'cover_art');
    params.append('contentRating[]', 'safe');
    params.append('contentRating[]', 'suggestive');
    params.append('hasAvailableChapters', 'true');

    const sortMap = {
      followedCount: ['followedCount', 'desc'],
      latestUpload: ['latestUploadedChapter', 'desc'],
      rating: ['rating', 'desc'],
      year: ['year', 'desc'],
    };
    const [sortKey, sortDir] = sortMap[sort] || sortMap.followedCount;
    params.append(`order[${sortKey}]`, sortDir);

    if (genre) params.append('includedTags[]', genre);
    if (status) params.append('status[]', status);
    if (type) {
      const pubMap = { manga: 'ja', manhwa: 'ko', manhua: 'zh' };
      if (pubMap[type]) params.append('originalLanguage[]', pubMap[type]);
    }

    const { status: httpStatus, body } = await httpsGet(`https://api.mangadex.org/manga?${params.toString()}`);
    if (httpStatus !== 200 || !body.data) return res.status(200).json({ results: [], total: 0 });
    return res.status(200).json({ results: body.data.map(mapManga), total: body.total });
  } catch (error) {
    console.error('Discover error:', error.message);
    return res.status(500).json({ error: error.message });
  }
};
