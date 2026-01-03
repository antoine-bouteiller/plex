{config, ...}: let
  dataDir = "${config.server.paths.app}/radarr";
  port = config.server.ports.radarr;
in {
  services.radarr = {
    enable = true;
    inherit dataDir;
    group = "media";

    settings = {
      auth = {
        method = "external";
      };
    };
  };

  services.caddy.virtualHosts."radarr.${config.server.domain}" = {
    extraConfig = ''
      import auth_proxy
      reverse_proxy localhost:${toString port} {
        header_down -Access-Control-Allow-Origin
      }
    '';
  };

  users.users.radarr.extraGroups = ["media"];

  systemd.tmpfiles.rules = [
    "d ${dataDir} 0755 radarr radarr - -"
  ];
}
