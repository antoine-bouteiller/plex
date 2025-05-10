import { radarrWebhook } from '#controllers/radarr_controller'
import { sonarrWebhook } from '#controllers/sonarr_controller'
import { transcodeAll } from '#controllers/transcode_controller'
import HyperExpress from 'hyper-express'

const webserver = new HyperExpress.Server()

webserver.post('/sonarr', sonarrWebhook)

webserver.post('/radarr', radarrWebhook)

webserver.post('/transcode/all', transcodeAll)

export default webserver
