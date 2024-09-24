import axios from "axios";
import { HEADERS, PLEX_URL } from "../../start/environement";
import { logger } from "../../start/logger";
import type { MediaStream } from "../types/plex";

export async function handleUpdateLanguage(
	mediaName: string,
	streams: MediaStream[],
	originalLanguage: string,
	partsId: number,
) {
	await handleSubtitles(streams, mediaName, partsId, originalLanguage);
	await handleAudio(streams, mediaName, partsId, originalLanguage);
}

function getStreams(
	stream: MediaStream[],
	streamType: number,
	languageTag: string,
) {
	const englishStreams = stream.filter(
		(stream: MediaStream) =>
			stream.streamType === streamType && stream.languageCode === languageTag,
	);
	if (englishStreams.length === 0) {
		return null;
	}

	return (
		englishStreams.find(
			(stream) =>
				!stream?.title?.toLocaleLowerCase()?.includes("sdh") &&
				!stream?.title?.toLocaleLowerCase()?.includes("forced"),
		) ||
		englishStreams.find(
			(stream) => !stream?.title?.toLocaleLowerCase()?.includes("forced"),
		) ||
		englishStreams[0]
	);
}

async function handleSubtitles(
	streams: MediaStream[],
	mediaName: string,
	partsId: number,
	originalLanguage: string,
) {
	const subtitleStream = getStreams(streams, 3, "eng");
	if (!subtitleStream) {
		logger.warn(`[${mediaName}] No english subtitle stream found`);
		return;
	}
	if (!subtitleStream.selected) {
		logger.info(`[${mediaName}] Setting subtitles for ${mediaName}`);
		await axios
			.put(
				`${PLEX_URL}/library/parts/${partsId}?subtitleStreamID=${
					originalLanguage === "fr" ? 0 : subtitleStream.id
				}&allParts=1`,
				undefined,
				{ headers: HEADERS },
			)
			.catch((err) => {
				logger.error(err?.reponse?.data);
			});
	}
}

async function handleAudio(
	streams: MediaStream[],
	mediaName: string,
	partsId: number,
	originalLanguage: string,
) {
	const audioStreams = getStreams(streams, 2, originalLanguage);
	if (!audioStreams) {
		logger.warn(`[${mediaName}] No ${originalLanguage} audio stream found`);
		return;
	}
	if (!audioStreams.selected) {
		logger.info(`[${mediaName}] Setting audio for ${originalLanguage}`);
		await axios
			.put(
				`${PLEX_URL}/library/parts/${partsId}?audioStreamID=${
					originalLanguage === "fr" ? 0 : audioStreams.id
				}&allParts=1`,
				undefined,
				{ headers: HEADERS },
			)
			.catch((err) => {
				logger.error(err?.message);
			});
	}
}
