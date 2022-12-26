const express = require('express');
const helmet = require('helmet');
const app = express();

app.use(helmet());
app.use(helmet.contentSecurityPolicy({
	directives: {
		connectSrc: [
			"'self'",
			"wss://irc-ws.chat.twitch.tv",
			"wss://gateway.discord.gg"
		],
		defaultSrc: [
			"'self'"
		],
		scriptSrc: [
			"'self'"
		],
		scriptSrcAttr: [
			"'self'"
		],
		objectSrc: [
			"'none'"
		],
		upgradeInsecureRequests: []
	}
}));

// GET
app.use(express.static('public'));
app.use(express.json());
//app.use(express.urlencoded({ extended: false }));

app.get("/twitch/api/helix/users", async (req, res) => {
	let response = await fetch('https://api.twitch.tv/helix/users', {
		headers: {
			'Client-ID': req.header('Client-ID'),
			'Authorization': req.header('Authorization')
		}
	});
	res.status(response.status);
	res.json(await response.json());
});

app.get("/discord/api/users/@me", async (req, res) => {
	let response = await fetch('https://discord.com/api/v10/users/@me', {
		headers: {
			'Authorization': req.header('Authorization'),
			'Content-Type': 'application/json'
		}
	});
	res.status(response.status);
	res.json(await response.json());
});

// POST
app.post("/discord/api/channels/:channelId/messages", async (req, res) => {
	let channelId = req.params.channelId;
	let json = JSON.stringify(req.body);
	let response = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
		method: 'POST',
		headers: {
			'Authorization': req.header('Authorization'),
			'Content-Type': 'application/json'
		},
		body: json
	});
	res.status(response.status);
	res.json(await response.json());
});

app.post("/discord/api/interactions/:interactionId/:interactionToken/callback", async (req, res) => {
	let interactionId = req.params.interactionId;
	let interactionToken = req.params.interactionToken;
	let json = JSON.stringify(req.body);
	let response = await fetch(`https://discord.com/api/v10/interactions/${interactionId}/${interactionToken}/callback`, {
		method: 'POST',
		headers: {
			'Authorization': req.header('Authorization'),
			'Content-Type': 'application/json'
		},
		body: json
	});
	res.status(response.status);
	res.send('');
});

// PATCH
app.patch("/discord/api/webhooks/:applicationId/:interactionToken/messages/@original", async (req, res) => {
	let applicationId = req.params.applicationId;
	let interactionToken = req.params.interactionToken;
	let json = JSON.stringify(req.body);
	let response = await fetch(`https://discord.com/api/v10/webhooks/${applicationId}/${interactionToken}/messages/@original`, {
		method: 'PATCH',
		headers: {
			'Authorization': req.header('Authorization'),
			'Content-Type': 'application/json'
		},
		body: json
	});
	res.status(response.status);
	res.json(await response.json());
});

// DELETE
app.delete("/twitch/api/helix/moderation/chat", async (req, res) => {
	let broadcasterId = req.query.broadcaster_id;
	let moderatorId = req.query.moderator_id;
	let messageId = req.query.message_id;
	let response = await fetch(`https://api.twitch.tv/helix/moderation/chat?broadcaster_id=${broadcasterId}&moderator_id=${moderatorId}&message_id=${messageId}`, {
		method: 'DELETE',
		headers: {
			'Client-ID': req.header('Client-ID'),
			'Authorization': req.header('Authorization')
		}
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
});

const PORT = process.env.PORT || 8080;
app.listen(PORT);
console.log(`Server listening on port ${PORT}`);
