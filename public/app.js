var clientId = 'tqj79y9ynmjj7d48qw081bchpmttq4';
﻿var accessToken = getHashValue('access_token');
var user = null;

// Added here to comply with CSP script-src and script-src-attr and not having to include 'unsafe-hashes'
document.getElementById('connect_button').addEventListener("click", connect);
document.getElementById('disconnect_button').addEventListener("click", disconnect);

if (window.accessToken) {
    document.getElementById("twitch_auth_link").style.display = "none";
    document.getElementById("connection_form_wrapper").style.display = "block";

    (async () => {
        window.user = (await fetch('/twitch/api/helix/users', {
            headers: {
            	'Content-Type': 'application/json',
                'Client-ID': clientId,
                'Authorization': `Bearer ${accessToken}`
            }
        }).then(res => res.json()).then(json => json.data[0]));
    })();
} else {
    document.getElementById("twitch_auth_link").style.display = "block";
    document.getElementById("connection_form_wrapper").style.display = "none";
}

function getHashValue(key) {
    let matches = location.hash.match(new RegExp(key+'=([^&]*)'));
    return matches ? matches[1] : null;
}

async function connect() {
    let username = document.getElementById("channel_name").value.toLowerCase();
    let discordToken = document.getElementById("discord_token").value;
    
    if(username.trim().length < 1) {
        alert("Please provide a channel name.");
        return;
    }

    if(discordToken.trim().length < 1) {
        alert("Please provide a discord token.");
        return;
    }
    if (!/([A-Za-z\d\-_]+)\.[A-Za-z\d\-_]+\.[A-Za-z\d\-_]+/g.test(discordToken)) {
    	alert("Please provide a VALID discord token.");
        return;
    }
    let discordTokenCheck = await fetch('/discord/api/users/@me', {
    	headers: {
           	'Content-Type': 'application/json',
    		'Authorization': `Bot ${discordToken}`
    	}
    }).then(res => res.ok);
    if (!discordTokenCheck) {
    	alert('Please provide a VALID discord token.');
    	return;
    }

    channelId = (await fetch(`/twitch/api/helix/users?login=${username}`, {
        headers: {
        	'Content-Type': 'application/json',
            'Client-ID': clientId,
            'Authorization': `Bearer ${accessToken}`
        }
    }).then(res => res.json()).then(json => json.data[0])).id;
    
    let options = {
        options: { debug: false },
        identity: {
            username: user.login,
            password: accessToken
        },
        channels: [ username ]
    };

    let dcClient = new WebSocket("wss://gateway.discord.gg/?v=10&encoding=json");
    let payload = {
    	op: 2,
    	d: {
    		token: discordToken,
    		intents: 512,
    		properties: {
    			$os: "linux",
    			$browser: "chrome",
    			$device: "chrome"
    		}
    	}
    };
    dcClient.addEventListener("open", x => {
    	dcClient.send(JSON.stringify(payload));
    });
    dcClient.addEventListener("message", async data => {
    	let x = data.data;
    	let payload = JSON.parse(x);
    	let { t, event, op, d } = payload;
    	switch (op) {
    		case 10: // Heartbeat
    			let { heartbeat_interval } = d;
    			setInterval(() => {
    				dcClient.send(JSON.stringify({ op: 1, d: null }));
    			}, heartbeat_interval);
    			break;
    	}
    	if (t == 'INTERACTION_CREATE') {
    		//console.log(`interactionCreate:${JSON.stringify(d)}`);
    		if (d.type == 1) { // PING
    			dcClient.send(JSON.stringify({
    				type: 1
    			}));
    		} else if (d.data.component_type == 2) { // Button
    			let customId = d.data.custom_id;
    			if (customId.startsWith('delete')) {
    				let username = d.message.content.substring(0, d.message.content.indexOf(':'));
    				let message = d.message.content.substring(d.message.content.indexOf(':') + 1).trim();
    				/*dcClient.send(JSON.stringify({
    					type: 5 // DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE
    				}));*/
    				await fetch(`/discord/api/interactions/${d.id}/${d.token}/callback`, {
    					method: 'POST',
				    	headers: {
				           	'Content-Type': 'application/json',
				    		'Authorization': `Bot ${discordToken}`
				    	},
				    	body: JSON.stringify({
				    		type: 5 // DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE
				    	})
    				}); // Returns Status-Code of 204
    				let deleteMessage = await fetch(`/twitch/api/helix/moderation/chat?broadcaster_id=${channelId}&moderator_id=${user.id}&message_id=${customId.substring('delete'.length)}`, {
    					method: 'DELETE',
    					headers: {
				        	'Content-Type': 'application/json',
				            'Client-ID': clientId,
				            'Authorization': `Bearer ${accessToken}`
				        }
    				}).then(resp => resp.json());
    				console.log(`TODO: /delete ${customId.substring('delete'.length)}`);
    				await fetch(`/discord/api/webhooks/${d.application_id}/${d.token}/messages/@original`, {
    					method: 'PATCH',
    					headers: {
    						'Content-Type': 'application/json',
    						'Authorization': `Bot ${discordToken}`
    					},
    					body: JSON.stringify({
    						content: deleteMessage.code == 204
    									? `Message \`${message}\` by \`${username}\` was deleted by <@${d.member.user.id}>`
    									: `<@${d.member.user.id}>, Message \`${message}\` by \`${username}\` couldn't be deleted due to: ${deleteMessage.message} (Code: ${deleteMessage.code})`
    					})
    				});
    			}
    			if (customId.startsWith('timeout')) {
    				console.log(`TODO: /timeout ${customId.substring('timeout'.length)}`);
    			}
    			if (customId.startsWith('ban')) {
    				console.log(`TODO: /ban ${customId.substring('ban'.length)}`);
    			}
    		}
    	}
    })

    let client = new tmi.Client(options);
    await client.connect().then(([server, port]) => {
        console.log("Connection successful.");
        document.getElementById("connect_button").style.display = "none";
        document.getElementById("disconnect_button").style.display = "inline";
        document.getElementById("connection_info").innerText = `Connected to ${username} on ${server}:${port}`;
    }).catch(err => {
        console.error(`Connection failed: ${err}`);
    });

    client.on('message', onMessage);
}

async function onMessage(channel, tags, message, self) {
    // Ignore echoed messages.
    if (self) return;

    console.log(`Got message from ${tags.username}: ${message}`);

    let discordToken = document.getElementById("discord_token").value;
    let channelId = document.getElementById("channel_id").value;
    fetch(`/discord/api/channels/${channelId}/messages`, {
    	method: 'POST',
    	headers: {
           	'Content-Type': 'application/json',
    		'Authorization': `Bot ${discordToken}`
    	},
    	body: JSON.stringify({
    		content: `${tags.username}: ${message}`,
    		components: [
    			{
    				type: 1, // Action Row
    				components: [
    					{
    						type: 2, // Button
    						label: "Delete",
    						style: 2, // Secondary (grey)
    						custom_id: `delete${tags.id}`
    					},
    					{
    						type: 2, // Button
    						label: "Timeout",
    						style: 2, // Secondary (grey)
    						custom_id: `timeout${tags.username}`
    					},
    					{
    						type: 2, // Button
    						label: "Ban",
    						style: 2, // Secondary (grey)
    						custom_id: `ban${tags.username}`
    					}
    				]
    			}
    		]
    	})
    });
}

async function disconnect() {
    // TODO disconnect (maybe)
    document.getElementById("connect_button").style.display = "inline";
    document.getElementById("disconnect_button").style.display = "none";
    document.getElementById("connection_info").innerText = "";
}
