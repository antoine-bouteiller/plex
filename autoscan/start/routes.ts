import { radarrWebhook } from '#controllers/radarr_controller'
import { sonarrWebhook } from '#controllers/sonarr_controller'
import { transcodeAll } from '#controllers/transcode_controller'
import Fastify from 'fastify'

const fastify = Fastify()

fastify.post('/sonarr', sonarrWebhook)

fastify.post('/radarr', radarrWebhook)

fastify.post('/transcode/all', transcodeAll)

export default fastify
