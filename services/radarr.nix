{config, ...}: let
  dataDir = "${config.server.paths.app}/radarr";
  port = config.server.ports.radarr;
  mediaGroup = config.server.mediaGroup;
in {
  services.radarr = {
    enable = true;
    inherit dataDir;
    group = mediaGroup;

    settings = {
      server.bindAddress = "*";
      auth = {
        method = "external";
      };
    };
  };

  services.caddy.virtualHosts."radarr.${config.server.network.domain}" = {
    extraConfig = ''
      import auth_proxy
      reverse_proxy localhost:${toString port} {
        header_down -Access-Control-Allow-Origin
      }
    '';
  };

  users.users.radarr.extraGroups = [mediaGroup];

  systemd.tmpfiles.rules = [
    "d ${dataDir} 0755 radarr radarr - -"
  ];
}
