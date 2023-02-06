import type { NextApiRequest, NextApiResponse } from 'next';

export default async (req: NextApiRequest, res: NextApiResponse) => {
    let broadcasterId = req.query.broadcaster_id;
    let moderatorId = req.query.moderator_id;
    let messageId = req.query.message_id;
    let json = JSON.stringify(req.body);
    let response = await fetch(`https://api.twitch.tv/helix/moderation/chat?broadcaster_id=${broadcasterId}&moderator_id=${moderatorId}&message_id=${messageId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': req.headers['Authorization'] as string,
            'Content-Type': 'application/json'
        },
        body: json
    });
    switch (response.status) {
        case 204:
            res.json({
                code: 204,
                message: 'Successfully deleted the specified messages.'
            });
            break;
        case 400:
            res.json({
                code: 400,
                message: 'You either deleted another moderators or the streamers messages.'
            });
            break;
        case 401:
            res.json({
                code: 401,
                message: 'Something is wrong with your twitch token. Please consider reauthenticating!'
            });
            break;
        case 403:
            res.json({
                code: 403,
                message: 'The moderating twitch user is not one of the streamers moderators.'
            });
            break;
        case 404:
            res.json({
                code: 404,
                message: 'The message either was not found or it was created more than 6 hours ago.'
            });
            break;
        default:
            res.json({
                code: 500,
                message: 'Internal server error'
            });
            break;
    }
}
