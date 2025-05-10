import type { Context } from 'telegraf'
import type { SceneContextScene, SceneSession } from 'telegraf/scenes'

export interface Session extends SceneSession {
  tmdbId: string
  mediaType: string
  title: string
}

export interface TelegramContext extends Context {
  scene: SceneContextScene<TelegramContext>

  session: Session
}
