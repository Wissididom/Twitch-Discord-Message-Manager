module.exports = async (req, res) => {
	let response = await fetch('https://discord.com/api/v10/users/@me', {
		headers: {
			'Authorization': req.header('Authorization'),
			'Content-Type': 'application/json'
		}
	});
	res.status(response.status);
	res.json(await response.json());
}
