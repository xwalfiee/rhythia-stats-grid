import axios from "axios";
import type { EnvironmentConfig } from "../config";
import type {
	NormalizedRhythiaStats,
	RhythiaProfileResponse,
	RhythiaUserScoresResponse,
} from "../types/rhythia";

function calculateTitleProgress(
	rank: number,
	rp: number,
): { title: string; cap: number } {
	if (rank <= 30 && rank > 0) {
		return { title: "Grandmaster", cap: rp };
	}

	switch (true) {
		case rp >= 10000:
			return { title: "Candidate Grandmaster", cap: rp };
		case rp >= 5000:
			return { title: "Master", cap: 10000 };
		case rp >= 2500:
			return { title: "Candidate Master", cap: 5000 };
		case rp >= 1500:
			return { title: "Expert", cap: 2500 };
		default:
			return { title: "Novice", cap: 1500 };
	}
}

export async function fetchProfileStatistics(
	config: EnvironmentConfig,
): Promise<NormalizedRhythiaStats> {
	try {
		const profileId = Number(config.rhythiaProfileId);

		if (!Number.isInteger(profileId) || profileId < 0) {
			throw new Error("Invalid Rhythia profile id.");
		}

		// profile info
		const profileRes = await axios.post<RhythiaProfileResponse>(
			`${config.rhythiaApiBaseUrl}/api/getProfile`,
			{
				session: "",
				id: profileId,
			},
		);

		if (!profileRes.data.user) {
			throw new Error(profileRes.data.error ?? "Profile not found.");
		}

		const user = profileRes.data.user;
		const rpValue = user.skill_points ?? 0;
		const rankValue = user.position ?? 0;

		const { title: userTitle, cap: nextTitlePointsNeeded } =
			calculateTitleProgress(rankValue, rpValue);

		const fileName = userTitle.toLowerCase().replace(/ /g, "_");
		const githubBaseUrl =
			"https://raw.githubusercontent.com/xwalfiee/rhythia-stats/refs/heads/main/assets";
		const badgeUrl = `${githubBaseUrl}/titles/${fileName}.png`;

		// top play
		const scoresRes = await axios.post<RhythiaUserScoresResponse>(
			`${config.rhythiaApiBaseUrl}/api/getUserScores`,
			{
				session: "",
				id: profileId,
				limit: 1,
			},
		);

		const topPlay = scoresRes.data.top?.[0];

		return {
			username: user.username ?? `user${user.id}`,
			displayName: user.username ?? `user${user.id}`,
			avatarUrl: user.avatar_url ?? "",

			user_title: userTitle,
			user_title_image: badgeUrl,
			user_rhythm_points: rpValue,
			user_next_title_points_needed: nextTitlePointsNeeded,
			user_rank: user.position ? `#${user.position}` : "Unranked",

			user_country_rank: user.country_position ?? 0,
			user_play_count: user.play_count ?? 0,
			user_squares_hit: user.squares_hit ?? 0,

			user_status: user.is_online
				? "Online"
				: user.activity_status === "active"
					? "Active"
					: "Offline",

			user_join_date: new Date(user.created_at).toLocaleDateString("en-GB", {
				day: "2-digit",
				month: "2-digit",
				year: "numeric",
			}),

			user_top_play: topPlay
				? `${topPlay.beatmapTitle ?? "Unknown map"} - ${topPlay.awarded_sp ?? 0} RP`
				: "No top play",
		};
	} catch (error) {
		const details =
			axios.isAxiosError(error) && error.response?.data
				? JSON.stringify(error.response.data)
				: error instanceof Error
					? error.message
					: String(error);

		throw new Error(`RhythiaDataRetrievalException: ${details}`);
	}
}
