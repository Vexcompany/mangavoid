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

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { mangaId, lang = 'en', offset = 0 } = req.query;
  if (!mangaId) return res.status(400).json({ error: 'mangaId required' });

  try {
    const params = new URLSearchParams();
    params.append('manga', mangaId);
    params.append('translatedLanguage[]', lang);
    params.append('order[chapter]', 'desc');
    params.append('limit', '100');
    params.append('offset', String(parseInt(offset)));
    params.append('includes[]', 'scanlation_group');

    const { status, body } = await httpsGet(`https://api.mangadex.org/chapter?${params.toString()}`);
    if (status !== 200 || !body.data) return res.status(200).json({ chapters: [], total: 0 });

    const chapters = body.data.map(ch => {
      const attrs = ch.attributes;
      const group = ch.relationships.find(r => r.type === 'scanlation_group');
      return {
        id: ch.id,
        chapter: attrs.chapter,
        title: attrs.title || '',
        pages: attrs.pages,
        publishAt: attrs.publishAt,
        groupName: group?.attributes?.name || 'Unknown',
        lang: attrs.translatedLanguage,
      };
    });

    return res.status(200).json({ chapters, total: body.total });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
