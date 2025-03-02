import { ffmpegPath, ffprobePath } from 'ffmpeg-ffprobe-static'
import ffmpeg from 'fluent-ffmpeg'

if (!ffmpegPath || !ffprobePath) {
  throw new Error('ffmpegPath not found')
}

ffmpeg.setFfprobePath(ffprobePath)
ffmpeg.setFfmpegPath(ffmpegPath)

export default ffmpeg
