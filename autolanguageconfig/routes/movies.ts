import axios from "axios";
import type { FastifyRequest } from "fastify";
import { readFileSync, writeFileSync } from "node:fs";
import { handleUpdateLanguage } from "../utils/handleUpdateLanguage";
import type { PlexReponse } from "../utils/types";

const headers = {
	"X-Plex-Token": process.env.PLEX_TOKEN,
};

const plexUrl = process.env.PLEX_URL;

export async function updateMoviesLanguage(request: FastifyRequest) {
	const alreadyTreared = JSON.parse(readFileSync("treated.json", "utf-8"));
	const newTreated: string[] = [];
	axios
		.get<PlexReponse>(`${plexUrl}/library/sections/2/all`, { headers })
		.then(async (res) => {
			for (const movie of res.data.MediaContainer.Metadata) {
				if (!alreadyTreared.includes(movie.ratingKey)) {
					handleUpdateLanguage(movie, request);
				}
				newTreated.push(movie.ratingKey);
			}
			writeFileSync("treated.json", JSON.stringify(newTreated));
		})
		.catch((err) => {
			request.log.error(err?.reponse?.data || err.message);
		});
}
