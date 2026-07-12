const https = require('https');

const HEADERS = {
  'accept': 'application/json, text/javascript, */*; q=0.01',
  'accept-language': 'en-US,en;q=0.9',
  'referer': 'https://mangafire.to/',
  'sec-fetch-dest': 'empty',
  'sec-fetch-mode': 'cors',
  'sec-fetch-site': 'same-origin',
  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'x-requested-with': 'XMLHttpRequest'
};

function httpsGet(url, headers) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
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
    params.append('keyword', q);
    params.append('content_rating[]', 'safe');
    params.append('content_rating[]', 'suggestive');
    params.append('limit', String(parseInt(limit)));

    const url = `https://mangafire.to/api/titles?${params.toString()}`;
    console.log('Fetching:', url);

    const { status, body } = await httpsGet(url, HEADERS);
    console.log('MangaFire status:', status);

    if (typeof body === 'object' && body.items) {
      const results = body.items.map(item => ({
        id: item.id,
        hid: item.hid,
        title: item.title,
        slug: item.slug,
        type: item.type,
        status: item.status,
        poster: item.poster?.large || item.poster?.url || '',
        url: 'https://mangafire.to' + item.url,
        year: item.year,
        latestChapter: item.latestChapter,
      }));
      return res.status(200).json({ results });
    }

    console.log('Unexpected body:', JSON.stringify(body).slice(0, 300));
    return res.status(200).json({ results: [] });
  } catch (error) {
    console.error('Search error:', error.message);
    return res.status(500).json({ error: error.message });
  }
};
