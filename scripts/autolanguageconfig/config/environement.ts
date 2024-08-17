import "dotenv/config";

export const HEADERS = {
  "X-Plex-Token": process.env.PLEX_TOKEN,
};
export const PLEX_URL = process.env.PLEX_URL;
export const TVDB_API_KEY = process.env.TVDB_API_KEY;
export const TVDB_URL = "https://api4.thetvdb.com/v4";
