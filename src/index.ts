import type { ExecutionContext } from "@cloudflare/workers-types";
import { loadAndValidateConfig } from "./config";
import { syncUserDiscordWidget } from "./services/discord.service";
import { fetchProfileStatistics } from "./services/rhythia.service";

async function initialize(env: unknown): Promise<void> {
	console.log(`[INFO] [${new Date().toISOString()}] Starting sync.`);

	try {
		const config = loadAndValidateConfig(env);
		const statistics = await fetchProfileStatistics(config);
		await syncUserDiscordWidget(config.discordUserId, statistics, config);
		console.log(`[INFO] [${new Date().toISOString()}] Initial sync completed.`);
	} catch (error) {
		console.error(
			`[ERROR] [${new Date().toISOString()}] Failed to complete initial sync: ${error}`,
		);
	}
}

export default {
	async fetch(
		_request: Request,
		env: unknown,
		ctx: ExecutionContext,
	): Promise<Response> {
		ctx.waitUntil(initialize(env));
		return new Response("Rhythia Sync Worker Active", {
			status: 200,
			headers: { "Content-Type": "text/plain" },
		});
	},
};
