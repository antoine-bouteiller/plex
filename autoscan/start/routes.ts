import HyperExpress from 'hyper-express';
import { radarrController } from '#controllers/radarr_controller';
import { sonarrController } from '#controllers/sonarr_controller';
import { transcodeController } from '#controllers/transcode_controller';

const webserver = new HyperExpress.Server();

webserver.post('/sonarr', sonarrController);

webserver.post('/radarr', radarrController);

webserver.post('/transcode/all', transcodeController);

export default webserver;
