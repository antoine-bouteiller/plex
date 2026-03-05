{config, ...}: let
  dataDir = "${config.server.paths.app}/sonarr";
  port = config.server.ports.sonarr;
  libraryOwnerGroup = config.server.libraryOwner.group;
in {
  services.sonarr = {
    enable = true;
    inherit dataDir;
    group = libraryOwnerGroup;

    settings = {
      server.bindAddress = "*";
      auth = {
        method = "external";
      };
    };
  };

  services.caddy.virtualHosts."sonarr.${config.server.network.domain}" = {
    extraConfig = ''
      import auth_proxy
      reverse_proxy localhost:${toString port} {
        header_down -Access-Control-Allow-Origin
      }
    '';
  };

  users.users.sonarr.extraGroups = [libraryOwnerGroup];
}
