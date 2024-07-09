import axios, { AxiosError } from "axios";
import { readFileSync, writeFileSync } from "node:fs";
import { handleUpdateLanguage } from "../utils/handleUpdateLanguage";
import type { PlexReponse } from "../utils/types";
import { logger } from "../utils/logger";

const headers = {
	"X-Plex-Token": process.env.PLEX_TOKEN,
};

const plexUrl = process.env.PLEX_URL;

export async function updateTvShowsLanguage() {
	try {
		const alreadyTreared = JSON.parse(readFileSync("treatedtv.json", "utf-8"));
		const newTreated: string[] = [];
		const tvshows = await axios.get<PlexReponse>(
			`${plexUrl}/library/sections/1/recentlyAdded`,
			{
				headers,
			},
		);
		for (const episode of tvshows.data.MediaContainer.Metadata) {
			if (!alreadyTreared.includes(episode.ratingKey)) {
				handleUpdateLanguage(episode);
			}
			newTreated.push(episode.ratingKey);
		}
		writeFileSync("treatedtv.json", JSON.stringify(newTreated));
	} catch (err) {
		if (err instanceof Error) {
			logger.error(err.message);
		} else if (err instanceof AxiosError) {
			logger.error(err.response?.data);
		}
	}
}
