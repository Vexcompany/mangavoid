const axios = require('axios');

const HEADERS = {
  'authority': 'mangafire.to',
  'accept': 'application/json, text/javascript, */*; q=0.01',
  'accept-language': 'en-US,en;q=0.9,id;q=0.8',
  'referer': 'https://mangafire.to/',
  'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
  'sec-ch-ua-mobile': '?0',
  'sec-ch-ua-platform': '"Windows"',
  'sec-fetch-dest': 'empty',
  'sec-fetch-mode': 'cors',
  'sec-fetch-site': 'same-origin',
  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'x-requested-with': 'XMLHttpRequest'
};

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { q, limit = 10 } = req.query;
  if (!q) return res.status(400).json({ error: 'Query required' });

  try {
    const response = await axios.get('https://mangafire.to/api/titles', {
      params: {
        keyword: q,
        'content_rating[]': ['safe', 'suggestive'],
        'genres_ex[]': [7, 268929, 268930, 268932],
        limit: parseInt(limit),
      },
      headers: HEADERS,
    });

    if (response.data && response.data.items) {
      const results = response.data.items.map(item => ({
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

    return res.status(200).json({ results: [] });
  } catch (error) {
    console.error('Search error:', error.message);
    return res.status(500).json({ error: 'Failed to fetch results' });
  }
};
