import axios from "axios";
import type { EnvironmentConfig } from "../config";
import type { DiscordWidgetPayload } from "../types/discord";
import type { NormalizedRhythiaStats } from "../types/rhythia";

export async function syncUserDiscordWidget(
	discordId: string,
	stats: NormalizedRhythiaStats,
	config: EnvironmentConfig,
): Promise<void> {
	const dynamicData: DiscordWidgetPayload["data"]["dynamic"] = [
		{ type: 1, name: "username", value: `@${stats.username}` },
		{ type: 3, name: "user_avatar", value: { url: stats.avatarUrl } },
		{
			type: 3,
			name: "user_title_image",
			value: { url: stats.user_title_image },
		},
		{ type: 1, name: "user_title", value: stats.user_title },
		{ type: 2, name: "user_rhythm_points", value: stats.user_rhythm_points },
		{ type: 1, name: "user_rank", value: stats.user_rank },
		{ type: 1, name: "user_country_rank", value: stats.user_country_rank },
		{ type: 2, name: "user_play_count", value: stats.user_play_count },
		{ type: 2, name: "user_squares_hit", value: stats.user_squares_hit },
		{ type: 1, name: "user_join_date", value: stats.user_join_date },
	];

	const payload: DiscordWidgetPayload = {
		username: stats.username,
		data: {
			dynamic: dynamicData,
		},
	};

	console.log(
		`[INFO] [${new Date().toISOString()}] Updating Discord widget for ${discordId}`,
	);

	console.log(
		`[DATA] Profile Stats: ${JSON.stringify(
			{
				username: stats.username,
				avatar: stats.avatarUrl,
				rhythm_points: stats.user_rhythm_points,
				user_title: stats.user_title,
				user_title_image: stats.user_title_image,
				rank: stats.user_rank,
				country_rank: stats.user_country_rank,
				play_count: stats.user_play_count,
				squares_hit: stats.user_squares_hit,
				join_date: stats.user_join_date,
			},
			null,
			2,
		)}`,
	);

	const url = `https://discord.com/api/v9/applications/${config.discordAppId}/users/${discordId}/identities/0/profile`;

	try {
		const response = await axios.patch(url, payload, {
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bot ${config.discordToken}`,
				"User-Agent":
					"DiscordBot (https://github.com/discord/discord-api-docs, 1.0.0)",
			},
		});

		if (![200, 201, 204].includes(response.status)) {
			throw new Error(JSON.stringify(response.data));
		}

		console.log(
			`[INFO] [${new Date().toISOString()}] Discord widget updated successfully for ${discordId}`,
		);
	} catch (error) {
		const details = axios.isAxiosError(error)
			? JSON.stringify(error.response?.data)
			: String(error);

		throw new Error(`DiscordWidgetMutationException: ${details}`);
	}
}
