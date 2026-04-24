import { put, list } from '@vercel/blob';

const BLOB_KEY = 'agile-projects/data.json';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        if (req.method === 'GET') {
            const { blobs } = await list({ prefix: BLOB_KEY });
            if (!blobs.length) return res.status(200).json([]);
            const r = await fetch(blobs[0].url);
            if (!r.ok) return res.status(200).json([]);
            return res.status(200).json(await r.json());
        }

        if (req.method === 'POST') {
            const projects = req.body;
            if (!Array.isArray(projects)) return res.status(400).json({ error: 'Expected array' });
            await put(BLOB_KEY, JSON.stringify(projects), {
                access: 'public',
                addRandomSuffix: false
            });
            return res.status(200).json({ success: true });
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: err.message });
    }
}
