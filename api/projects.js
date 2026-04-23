import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        await sql`
            CREATE TABLE IF NOT EXISTS projects (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                data JSONB NOT NULL,
                created_at TIMESTAMPTZ DEFAULT NOW()
            )
        `;

        if (req.method === 'GET') {
            const { rows } = await sql`SELECT data FROM projects ORDER BY created_at`;
            return res.status(200).json(rows.map(r => r.data));
        }

        if (req.method === 'POST') {
            const project = req.body;
            if (!project?.id || !project?.name) return res.status(400).json({ error: 'Missing id or name' });
            await sql`
                INSERT INTO projects (id, name, data)
                VALUES (${project.id}, ${project.name}, ${JSON.stringify(project)})
                ON CONFLICT (id) DO UPDATE SET data = ${JSON.stringify(project)}, name = ${project.name}
            `;
            return res.status(200).json({ success: true });
        }

        if (req.method === 'DELETE') {
            const { id } = req.query;
            if (!id) return res.status(400).json({ error: 'Missing id' });
            await sql`DELETE FROM projects WHERE id = ${id}`;
            return res.status(200).json({ success: true });
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Server error', detail: err.message });
    }
}
