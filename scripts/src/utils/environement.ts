import { readFileSync } from "node:fs";
import { parse } from "yaml";
import type { Config } from "./types";

const config: Config = parse(readFileSync("config.yml", "utf-8"));

export const headers = {
	"X-Plex-Token": config.targets.plex[0].token,
};
export const plexUrl = config.targets.plex[0].url;
