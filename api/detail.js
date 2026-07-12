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

  const { hid } = req.query;
  if (!hid) return res.status(400).json({ error: 'HID required' });

  try {
    const params = new URLSearchParams();
    params.append('includes[]', 'cover_art');
    params.append('includes[]', 'author');
    params.append('includes[]', 'artist');

    const { status, body } = await httpsGet(
      `https://api.mangadex.org/manga/${hid}?${params.toString()}`
    );

    if (status !== 200 || !body.data) {
      return res.status(404).json({ error: 'Not found' });
    }

    const d = body.data;
    const attrs = d.attributes;

    const coverRel = d.relationships.find(r => r.type === 'cover_art');
    const coverId = coverRel?.attributes?.fileName;
    const poster = coverId
      ? `/api/cover?url=https://uploads.mangadex.org/covers/${d.id}/${coverId}.512.jpg`
      : '';

    const title =
      attrs.title.en ||
      attrs.title.ja ||
      attrs.title['ja-ro'] ||
      Object.values(attrs.title)[0] ||
      'Unknown';

    const altTitles = attrs.altTitles
      ? attrs.altTitles.flatMap(t => Object.values(t)).filter(Boolean).slice(0, 5)
      : [];

    const synopsis =
      attrs.description?.en ||
      attrs.description?.ja ||
      Object.values(attrs.description || {})[0] ||
      '';

    const genres = (attrs.tags || [])
      .filter(t => t.attributes.group === 'genre')
      .map(t => t.attributes.name.en || Object.values(t.attributes.name)[0]);

    const themes = (attrs.tags || [])
      .filter(t => t.attributes.group === 'theme')
      .map(t => t.attributes.name.en || Object.values(t.attributes.name)[0]);

    const authors = d.relationships
      .filter(r => r.type === 'author')
      .map(r => r.attributes?.name).filter(Boolean);

    const artists = d.relationships
      .filter(r => r.type === 'artist')
      .map(r => r.attributes?.name).filter(Boolean);

    const statusMap = { ongoing: 1, completed: 2, hiatus: 3, cancelled: 4 };
    const typeMap = { ja: 1, ko: 2, zh: 3 };

    return res.status(200).json({
      id: d.id,
      hid: d.id,
      title,
      slug: d.id,
      type: typeMap[attrs.originalLanguage] || 1,
      status: statusMap[attrs.status] || 0,
      contentRating: attrs.contentRating,
      poster,
      url: `https://mangadex.org/title/${d.id}`,
      year: attrs.year,
      latestChapter: attrs.lastChapter,
      synopsis,
      altTitles,
      rating: null,
      ratingCount: null,
      follows: null,
      languages: attrs.availableTranslatedLanguages || [],
      genres,
      themes,
      demographics: attrs.publicationDemographic ? [attrs.publicationDemographic] : [],
      authors,
      artists,
    });
  } catch (error) {
    console.error('Detail error:', error.message);
    return res.status(500).json({ error: error.message });
  }
};
