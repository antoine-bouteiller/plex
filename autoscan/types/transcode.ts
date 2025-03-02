import type Ffmpeg from 'fluent-ffmpeg'

export type StreamData = Ffmpeg.FfprobeStream & {
  tags?: Record<string, string | undefined>
}
