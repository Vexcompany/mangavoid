const https = require('https');
const http = require('http');

const ALLOWED_HOSTS = [
  'uploads.mangadex.org',
  'cmdxd98sb0x3yprd.mangadex.network',
];

function isAllowed(hostname) {
  return ALLOWED_HOSTS.some(h => hostname === h || hostname.endsWith('.mangadex.network'));
}

module.exports = async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).send('URL required');

  let parsedUrl;
  try { parsedUrl = new URL(url); }
  catch { return res.status(400).send('Invalid URL'); }

  if (!isAllowed(parsedUrl.hostname)) return res.status(403).send('Forbidden');

  try {
    const lib = parsedUrl.protocol === 'https:' ? https : http;
    await new Promise((resolve, reject) => {
      const proxyReq = lib.get(url, {
        headers: {
          'User-Agent': 'MangaVoid/1.0',
          'Referer': 'https://mangadex.org/',
        }
      }, (proxyRes) => {
        res.setHeader('Content-Type', proxyRes.headers['content-type'] || 'image/jpeg');
        res.setHeader('Cache-Control', 'public, max-age=86400');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.status(proxyRes.statusCode);
        proxyRes.pipe(res);
        proxyRes.on('end', resolve);
        proxyRes.on('error', reject);
      });
      proxyReq.on('error', reject);
      proxyReq.setTimeout(15000, () => { proxyReq.destroy(); reject(new Error('Timeout')); });
    });
  } catch (error) {
    console.error('Page proxy error:', error.message);
    if (!res.headersSent) res.status(500).send('Failed');
  }
};
