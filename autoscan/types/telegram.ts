import type { MediaType } from '#types/plex'
import type { Context, Scenes } from 'telegraf'

export interface Session extends Scenes.SceneSession<SceneSession> {
  tmdbId: string
  mediaType: MediaType
  title: string
}

export interface TelegramContext extends Context {
  scene: Scenes.SceneContextScene<TelegramContext, SceneSession>

  session: Session
}

interface SceneSession extends Scenes.SceneSessionData {
  page: number
  total: number
}
