import axios from "axios";
import { HEADERS, PLEX_URL } from "../../config/environement";
import type { PlexReponse } from "../types/plex";

export async function getMediaByKey(key: string) {
  const response = await axios.get<PlexReponse>(`${PLEX_URL}${key}`, {
    headers: HEADERS,
  });
  return response.data.MediaContainer.Metadata;
}

export async function getSectionMedia(id: number) {
  const response = await axios.get<PlexReponse>(
    `${PLEX_URL}/library/sections/${id}/recentlyAdded`,
    {
      headers: HEADERS,
    }
  );
  return response.data.MediaContainer.Metadata;
}
