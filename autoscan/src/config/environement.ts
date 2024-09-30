import "dotenv/config";
import { readFileSync } from "node:fs";
import { parse } from "yaml";

type Config = {
  plex: {
    url: string;
    token: string;
  };
  tmdb: {
    url: string;
    token: string;
  };
};

const file = readFileSync(
  process.env.NODE_ENV === "dev"
    ? "../configs/autoscan.yml"
    : "/autoscan/resources/autoscan.yml",
  "utf8",
);

const config: Config = parse(file);

export { config };
