const https = require('https');

const HEADERS = {
  'authority': 'mangafire.to',
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
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error('Invalid JSON')); }
      });
    });
    req.on('error', reject);
    req.setTimeout(10000, () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { hid } = req.query;
  if (!hid) return res.status(400).json({ error: 'HID required' });

  try {
    const data = await httpsGet(`https://mangafire.to/api/titles/${hid}`, HEADERS);

    if (data && data.data) {
      const d = data.data;
      return res.status(200).json({
        id: d.id,
        hid: d.hid,
        title: d.title,
        slug: d.slug,
        type: d.type,
        status: d.status,
        contentRating: d.contentRating,
        poster: d.poster?.large || d.poster?.url || '',
        url: 'https://mangafire.to' + d.url,
        year: d.year,
        latestChapter: d.latestChapter,
        chapterUpdatedAt: d.chapterUpdatedAt,
        synopsis: d.synopsisHtml ? d.synopsisHtml.replace(/<[^>]*>?/gm, '').trim() : '',
        altTitles: d.altTitles || [],
        rating: d.rating,
        ratingCount: d.ratingCount,
        follows: d.follows,
        languages: d.languages || [],
        genres: d.genres ? d.genres.map(g => g.title) : [],
        themes: d.themes ? d.themes.map(t => t.title) : [],
        demographics: d.demographics ? d.demographics.map(dm => dm.title) : [],
        authors: d.authors ? d.authors.map(a => a.title) : [],
        artists: d.artists ? d.artists.map(ar => ar.title) : [],
      });
    }

    return res.status(404).json({ error: 'Not found' });
  } catch (error) {
    console.error('Detail error:', error.message);
    return res.status(500).json({ error: error.message });
  }
};
