import axios from "axios";
import { readFileSync, writeFileSync } from "node:fs";
import { TVDB_URL } from "../../config/environement";
import { logger } from "../../config/logger";
import type { TvdbObject, TvdbToken } from "../types/tvdb";

async function login() {
  const { token, expires }: TvdbToken = JSON.parse(
    readFileSync("config/tvdbToken.json", "utf-8")
  );

  if (token && expires < Date.now()) {
    return token;
  }
  return axios
    .post(`${TVDB_URL}/login`, {
      apikey: process.env.TVDB_API_KEY,
    })
    .then((res) => {
      const token = res.data.data.token;
      const expires = Date.now() + 1000 * 60 * 60 * 24 * 30;
      writeFileSync(
        "config/tvdbToken.json",
        JSON.stringify({ token, expires })
      );
      return token;
    });
}

export async function getTvdbSerieById(tvdbId: string) {
  const token = await login();
  return axios
    .get<{ data: TvdbObject }>(`${TVDB_URL}/series/${tvdbId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((res) => {
      return res.data.data.originalLanguage;
    })
    .catch((err) => {
      logger.error(err?.response?.data);
      return "eng";
    });
}

export async function getTvdbMovieByYearAndName(name: string, year: number) {
  const token = await login();
  return axios
    .get<{ data: TvdbObject[] }>(`${TVDB_URL}/search`, {
      params: {
        query: name,
        type: "movie",
        year: year,
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((res) => {
      return res.data.data[0].primary_language;
    })
    .catch((err) => {
      logger.error(err?.response?.data);
      return "eng";
    });
}
