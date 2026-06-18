export interface RhythiaProfileResponse {
	readonly error?: string;
	readonly user?: {
		readonly id: number;
		readonly username: string | null;
		readonly about_me: string | null;
		readonly avatar_url: string | null;
		readonly profile_image: string | null;
		readonly created_at: number;
		readonly play_count: number | null;
		readonly skill_points: number | null;
		readonly squares_hit: number | null;
		readonly position: number | null;
		readonly country_position: number | null;
		readonly activity_status: "active" | "inactive";
		readonly is_online: boolean;
	};
}

export interface RhythiaUserScoresResponse {
	readonly error?: string;
	readonly top?: {
		readonly awarded_sp: number | null;
		readonly beatmapTitle: string | null;
	}[];
}

export interface NormalizedRhythiaStats {
	readonly username: string;
	readonly displayName: string;
	readonly avatarUrl: string;

	readonly user_title: string;
	readonly user_title_image: string;
	readonly user_rhythm_points: number;
	readonly user_next_title_points_needed: number;
	readonly user_rank: string;
	readonly user_country_rank: number;
	readonly user_play_count: number;
	readonly user_squares_hit: number;
	readonly user_status: "Online" | "Active" | "Offline";
	readonly user_join_date: string;
	readonly user_top_play: string;
}
