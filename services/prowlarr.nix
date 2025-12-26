{config, ...}: let
  dataDir = "${config.server.paths.app}/prowlarr";
  port = config.server.ports.prowlarr;
in {
  services.prowlarr = {
    enable = true;
    inherit dataDir;

    settings = {
      auth = {
        method = "external";
      };
    };
  };

  services.caddy.virtualHosts."prowlarr.${config.server.domain}" = {
    extraConfig = ''
      import auth_proxy
      reverse_proxy localhost:${toString port} {
        header_down -Access-Control-Allow-Origin
      }
    '';
  };
}
