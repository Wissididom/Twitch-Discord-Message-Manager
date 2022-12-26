export default async (req, res) => {
	let response = await fetch('https://api.twitch.tv/helix/users', {
		headers: {
			'Client-ID': req.header('Client-ID'),
			'Authorization': req.header('Authorization')
		}
	});
	res.status(response.status);
	res.json(await response.json());
}
