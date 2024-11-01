import { handleError } from "#exceptions/handler";
import "dotenv/config";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { parse } from "yaml";
import { z } from "zod";

declare global {
  var config: Config;
}

const configSchema = z.object({
  transcodeCachePath: z.string(),
  plex: z.object({
    url: z.string(),
    token: z.string(),
  }),
  tmdb: z.object({
    url: z.string(),
    token: z.string(),
  }),
});

type Config = z.infer<typeof configSchema>;

const getConfigPath = () => {
  switch (process.env.NODE_ENV) {
    case "dev":
      return "../configs/autoscan.yml";
    default:
      return "/autoscan/resources/autoscan.yml";
  }
};

const loadConfig = () => {
  const path = getConfigPath();

  try {
    const fileContent = readFileSync(path, "utf8");
    const transcodeCachePath = "/data/transcode_cache";
    mkdirSync(transcodeCachePath, { recursive: true });
    const parsedConfig = parse(fileContent);
    return configSchema.parse({ ...parsedConfig, transcodeCachePath });
  } catch (error) {
    handleError(error);
    process.exit(1);
  }
};

export { loadConfig };
