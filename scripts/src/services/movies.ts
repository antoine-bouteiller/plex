import axios, { AxiosError } from "axios";
import { readFileSync, writeFileSync } from "node:fs";
import { handleUpdateLanguage } from "../utils/handleUpdateLanguage";
import type { PlexReponse } from "../utils/types";
import { logger } from "../utils/logger";

const headers = {
	"X-Plex-Token": process.env.PLEX_TOKEN,
};

const plexUrl = process.env.PLEX_URL;

export async function updateMoviesLanguage() {
	try {
		const alreadyTreared = JSON.parse(
			readFileSync("treatedmovies.json", "utf-8"),
		);
		const newTreated: string[] = [];
		const movies = await axios.get<PlexReponse>(
			`${plexUrl}/library/sections/2/all`,
			{ headers },
		);
		for (const movie of movies.data.MediaContainer.Metadata) {
			if (!alreadyTreared.includes(movie.ratingKey)) {
				handleUpdateLanguage(movie);
			}
			newTreated.push(movie.ratingKey);
		}
		writeFileSync("treatedmovies.json", JSON.stringify(newTreated));
	} catch (err) {
		if (err instanceof Error) {
			logger.error(err.message);
		} else if (err instanceof AxiosError) {
			logger.error(err.response?.data);
		}
	}
}
