import HyperExpress from "hyper-express";
import { radarrController } from "#controllers/radarrController";
import { sonarrController } from "#controllers/sonarrController";
import { transcodeController } from "#controllers/transcodeController";

const webserver = new HyperExpress.Server();

webserver.post("/sonarr", sonarrController);

webserver.post("/radarr", radarrController);

webserver.post("/transcode/all", transcodeController);

export default webserver;
