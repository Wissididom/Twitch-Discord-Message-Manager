import type { NextApiRequest, NextApiResponse } from 'next';

export default async (req: NextApiRequest, res: NextApiResponse) => {
    let applicationId = req.query.applicationId;
    let interactionToken = req.query.interactionToken;
    let response = await fetch('https://api.twitch.tv/helix/users', {
        headers: {
            'Authorization': req.headers['Authorization'] as string,
            'Content-Type': 'application/json'
        }
    });
    res.status(response.status);
    res.json(await response.json());
}
