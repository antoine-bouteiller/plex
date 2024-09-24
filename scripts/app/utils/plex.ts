import axios, { AxiosError } from "axios";
import { HEADERS, PLEX_URL } from "../../start/environement";
import { logger } from "../../start/logger";
import type { PlexReponse } from "../types/plex";

export async function getMediaByKey(key: string) {
  const response = await sendPlexRequest(`${PLEX_URL}${key}`);
  return response?.Metadata ?? [];
}

export async function getSectionMedia(id: number) {
  const response = await sendPlexRequest(
    `${PLEX_URL}/library/sections/${id}/recentlyAdded`,
  );
  return response?.Metadata ?? [];
}

export async function getSections() {
  const response = await sendPlexRequest(`${PLEX_URL}/library/sections`);
  return response?.Directory ?? [];
}

async function sendPlexRequest(url: string) {
  try {
    const response = await axios.get<PlexReponse>(url, {
      headers: HEADERS,
    });
    return response.data.MediaContainer;
  } catch (err) {
    if (err instanceof Error) {
      logger.error(err.message);
    } else if (err instanceof AxiosError) {
      logger.error(err.response?.data);
    }
  }
}
