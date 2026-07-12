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

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { mangaId } = req.query;
  if (!mangaId) return res.status(400).json({ error: 'mangaId required' });

  try {
    const params = new URLSearchParams();
    params.append('manga[]', mangaId);
    params.append('limit', '100');
    params.append('order[volume]', 'asc');

    const { body } = await httpsGet(`https://api.mangadex.org/cover?${params.toString()}`);
    if (!body?.data) return res.status(200).json({ covers: [] });

    const covers = body.data.map(c => ({
      id: c.id,
      volume: c.attributes.volume,
      locale: c.attributes.locale,
      url: `/api/cover?url=https://uploads.mangadex.org/covers/${mangaId}/${c.attributes.fileName}.512.jpg`,
      thumb: `/api/cover?url=https://uploads.mangadex.org/covers/${mangaId}/${c.attributes.fileName}.256.jpg`,
    }));

    return res.status(200).json({ covers });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
