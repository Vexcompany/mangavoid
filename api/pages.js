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

  const { chapterId } = req.query;
  if (!chapterId) return res.status(400).json({ error: 'chapterId required' });

  try {
    const { status, body } = await httpsGet(`https://api.mangadex.org/at-home/server/${chapterId}`);
    if (status !== 200 || !body.chapter) return res.status(404).json({ error: 'Chapter not found' });

    const { baseUrl, chapter } = body;
    const pages = chapter.data.map((filename, i) => ({
      index: i,
      url: `/api/page?url=${encodeURIComponent(`${baseUrl}/data/${chapter.hash}/${filename}`)}`,
      filename,
    }));

    return res.status(200).json({ pages, total: pages.length });
  } catch (error) {
    console.error('Pages error:', error.message);
    return res.status(500).json({ error: error.message });
  }
};
