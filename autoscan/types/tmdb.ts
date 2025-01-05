import type { iso1 } from '#types/iso_codes'

export interface TmdbResponse {
  languages: string[]
  name: string
  original_language: iso1
  title: string
}
