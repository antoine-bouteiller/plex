{config, ...}: {
  services.radarr = {
    enable = true;
    dataDir = "${config.server.paths.app}/radarr";

    settings = {
      auth = {
        method = "external";
      };
    };
  };

  services.caddy.virtualHosts."radarr.${config.server.domain}" = {
    extraConfig = ''
      import auth_proxy
      reverse_proxy localhost:7878 {
        header_down -Access-Control-Allow-Origin
      }
    '';
  };

  users.users.radarr.extraGroups = ["media"];
}
