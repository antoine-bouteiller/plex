import axios from "axios";
import type { FastifyRequest } from "fastify";
import { readFileSync, writeFileSync } from "node:fs";
import { handleUpdateLanguage } from "../utils/handleUpdateLanguage";
import type { PlexReponse } from "../utils/types";

const headers = {
	"X-Plex-Token": process.env.PLEX_TOKEN,
};

const plexUrl = process.env.PLEX_URL;

export async function updateTvShowsLanguage(request: FastifyRequest) {
	const alreadyTreared = JSON.parse(readFileSync("treated.json", "utf-8"));
	const newTreated: string[] = [];
	axios
		.get<PlexReponse>(`${plexUrl}/library/sections/1/all`, { headers })
		.then(async (res) => {
			for (const show of res.data.MediaContainer.Metadata) {
				if (!alreadyTreared.includes(show.ratingKey)) {
					const seasons = await fetchByKey(show.key);
					for (const season of seasons.data.MediaContainer.Metadata) {
						const episodes = await fetchByKey(season.key);
						for (const episode of episodes.data.MediaContainer.Metadata) {
							handleUpdateLanguage(episode, request);
						}
					}
				}
				newTreated.push(show.ratingKey);
			}
			writeFileSync("treated.json", JSON.stringify(newTreated));
		})
		.catch((err) => {
			request.log.error(err?.reponse?.data || err.message);
		});
}

async function fetchByKey(key: string) {
	return axios.get(`${plexUrl}${key}`, { headers });
}
