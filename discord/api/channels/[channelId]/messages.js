module.exports = async (req, res) => {
	let channelId = req.query.channelId;
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
}
