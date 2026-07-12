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

  const { hid } = req.query;
  if (!hid) return res.status(400).json({ error: 'HID required' });

  try {
    const response = await axios.get(`https://mangafire.to/api/titles/${hid}`, {
      headers: HEADERS,
    });

    if (response.data && response.data.data) {
      const d = response.data.data;
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
    return res.status(500).json({ error: 'Failed to fetch detail' });
  }
};
