import type { NextApiRequest, NextApiResponse } from 'next';

export default async (req: NextApiRequest, res: NextApiResponse) => {
    let interactionId = req.query.interactionId;
    let interactionToken = req.query.interactionToken;
    let json = JSON.stringify(req.body);
    let response = await fetch(`https://discord.com/api/v10/interactions/${interactionId}/${interactionToken}/callback`, {
        method: 'POST',
        headers: {
            'Authorization': req.headers['Authorization'] as string,
            'Content-Type': 'application/json'
        },
        body: json
    });
    res.status(response.status);
    res.json('');
}
