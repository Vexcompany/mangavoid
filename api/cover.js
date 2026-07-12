const https = require('https');

module.exports = async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).send('URL required');

  const allowedHost = 'uploads.mangadex.org';
  let parsedUrl;
  try {
    parsedUrl = new URL(url);
  } catch {
    return res.status(400).send('Invalid URL');
  }

  if (parsedUrl.hostname !== allowedHost) {
    return res.status(403).send('Forbidden');
  }

  try {
    await new Promise((resolve, reject) => {
      const proxyReq = https.get(url, { headers: { 'User-Agent': 'MangaVoid/1.0', 'Referer': 'https://mangadex.org/' } }, (proxyRes) => {
        res.setHeader('Content-Type', proxyRes.headers['content-type'] || 'image/jpeg');
        res.setHeader('Cache-Control', 'public, max-age=86400');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.status(proxyRes.statusCode);
        proxyRes.pipe(res);
        proxyRes.on('end', resolve);
      });
      proxyReq.on('error', reject);
      proxyReq.setTimeout(10000, () => { proxyReq.destroy(); reject(new Error('Timeout')); });
    });
  } catch (error) {
    console.error('Cover proxy error:', error.message);
    res.status(500).send('Failed to fetch image');
  }
};
