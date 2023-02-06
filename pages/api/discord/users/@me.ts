import type { NextApiRequest, NextApiResponse } from 'next';

export default async (req: NextApiRequest, res: NextApiResponse) => {
    let response = await fetch('https://discord.com/api/v10/users/@me', {
        headers: {
            'Authorization': req.headers['Authorization'] as string,
            'Content-Type': 'application/json'
        }
    });
    res.status(response.status);
    res.json(await response.json());
}
