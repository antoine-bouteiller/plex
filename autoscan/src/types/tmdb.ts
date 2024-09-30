import type { iso1 } from "#types/isoCodes";

export type TmdbResponse = {
  languages: string[];
  title: string;
  name: string;
  original_language: iso1;
};
