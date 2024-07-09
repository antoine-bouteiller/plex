import axios from "axios";
import { headers, plexUrl } from "./environement";
import type { Media, MediaStream } from "./types";
import { logger } from "./logger";

export async function handleUpdateLanguage(media: Media) {
	const partsId = media.Media[0].Part[0].id;
	const stream = await axios
		.get(`${plexUrl}${media.key}`, {
			headers: headers,
		})
		.then((res) => {
			return res.data.MediaContainer.Metadata[0].Media[0].Part[0].Stream.filter(
				(stream: MediaStream) =>
					stream.streamType === 3 &&
					stream.languageTag === "en" &&
					!stream?.title?.toLocaleLowerCase().includes("sdh") &&
					!stream?.title?.toLocaleLowerCase().includes("forced"),
			)[0];
		});
	if (!stream) {
		logger.info(`No englisg stream found for ${media.title}`);
		return;
	}
	if (!stream.selected) {
		logger.info(`Setting subtitles for ${media.title} in English`);
		await axios
			.put(
				`${plexUrl}/library/parts/${partsId}?subtitleStreamID=${stream.id}&allParts=1`,
				undefined,
				{ headers: headers },
			)
			.catch((err) => {
				logger.error(err?.reponse?.data);
			});
	} else {
		logger.info(`Subtitles for ${media.title} already set to English`);
	}
}
