export default async function handler(req, res) {
  // CORS headers - allow from anywhere
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { path } = req.query;
  if (!path) return res.status(400).json({ error: 'Missing path' });

  const API_KEY = process.env.FOOTBALL_API_KEY;
  if (!API_KEY) return res.status(500).json({ error: 'API key not configured' });

  const url = 'https://api.football-data.org/v4/' + (Array.isArray(path) ? path.join('/') : path);
  
  // Forward query params except 'path'
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(req.query)) {
    if (k !== 'path') params.append(k, v);
  }
  const fullUrl = params.toString() ? url + '?' + params.toString() : url;

  try {
    const response = await fetch(fullUrl, {
      headers: { 'X-Auth-Token': API_KEY }
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
