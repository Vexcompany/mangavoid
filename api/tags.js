const https = require('https');

function httpsGet(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { 'User-Agent': 'MangaVoid/1.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch { resolve(null); }
      });
    });
    req.on('error', reject);
    req.setTimeout(10000, () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const body = await httpsGet('https://api.mangadex.org/manga/tag');
    if (!body?.data) return res.status(200).json({ tags: [] });

    const tags = body.data
      .filter(t => t.attributes.group === 'genre' || t.attributes.group === 'theme')
      .map(t => ({
        id: t.id,
        name: t.attributes.name.en || Object.values(t.attributes.name)[0],
        group: t.attributes.group,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    return res.status(200).json({ tags });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
