import type { CommandResponse } from '@discord/embedded-app-sdk';
import './style.css';
import { discordSdk } from './discordSdk';
import { getUserAvatarUrl } from './utils/getUserAvatarUrl';
import { getUserDisplayName } from './utils/getUserDisplayName';
import { Client, Room } from 'colyseus.js';
import type { IGuildsMembersRead, IColyseus } from './types';
import { State } from '../../server/src/entities/State';

type Auth = CommandResponse<'authenticate'>;
let auth: Auth;
let guildMember: IGuildsMembersRead | null = null;
let room: Room<State> | null = null;

// Once setupDiscordSdk is complete, we can assert that "auth" is initialized
setupDiscordSdk().then(async access_token => {
	guildMember = await fetch(
		`/.proxy/discord/api/users/@me/guilds/${discordSdk.guildId}/member`,
		{
			method: 'get',
			headers: { Authorization: `Bearer ${access_token}` },
		}
	)
		.then((j) => j.json())
		.catch(() => {
			return null;
		});

	const wsUrl = `wss://${location.host}/.proxy/api/colyseus`;
	const client = new Client(wsUrl);

	let roomName = 'Channel';

	// Requesting the channel in GDMs (when the guild ID is null) requires
	// the dm_channels.read scope which requires Discord approval.
	if (discordSdk.channelId != null && discordSdk.guildId != null) {
		// Over RPC collect info about the channel
		const channel = await discordSdk.commands.getChannel({ channel_id: discordSdk.channelId });
		if (channel.name != null) {
			roomName = channel.name;
		}
	}

	const avatarUri = getUserAvatarUrl({
		guildMember,
		user: auth.user,
	});

	// Get the user's guild nickname. If none set, fall back to global_name, or username
	// Note - this name is note guaranteed to be unique
	const name = getUserDisplayName({
		guildMember,
		user: auth.user,
	});

	room = await client.joinOrCreate<State>('world', {
		channelId: discordSdk.channelId,
		roomName,
		userId: auth.user.id,
		name,
		avatarUri,
	});
});

async function setupDiscordSdk() {
	await discordSdk.ready();

	// Authorize with Discord Client
	const { code } = await discordSdk.commands.authorize({
		client_id: import.meta.env.VITE_CLIENT_ID,
		response_type: 'code',
		state: '',
		prompt: 'none',
		// More info on scopes here: https://discord.com/developers/docs/topics/oauth2#shared-resources-oauth2-scopes
		scope: [
			// Activities will launch through app commands and interactions of user-installable apps.
			// https://discord.com/developers/docs/tutorials/developing-a-user-installable-app#configuring-default-install-settings-adding-default-install-settings
			'applications.commands',

			// "applications.builds.upload",
			// "applications.builds.read",
			// "applications.store.update",
			// "applications.entitlements",
			// "bot",
			'identify',
			// "connections",
			// "email",
			// "gdm.join",
			'guilds',
			// "guilds.join",
			'guilds.members.read',
			// "messages.read",
			// "relationships.read",
			// 'rpc.activities.write',
			// "rpc.notifications.read",
			// "rpc.voice.write",
			// 'rpc.voice.read',
			// "webhook.incoming",
		],
	});

	// Retrieve an access_token from your activity's server
	// /.proxy/ is prepended here in compliance with CSP
	// see https://discord.com/developers/docs/activities/development-guides#construct-a-full-url
	const response = await fetch('/.proxy/api/token', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			code,
		}),
	});
	const { access_token } = await response.json();

	// Authenticate with Discord client (using the access_token)
	auth = await discordSdk.commands.authenticate({
		access_token,
	});

	if (auth == null) {
		throw new Error('Authenticate command failed');
	}

	return access_token;
}
