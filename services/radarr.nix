{
  config,
  pkgs,
  ...
}: let
  dataDir = "${config.server.paths.app}/radarr";
  port = config.server.ports.radarr;
  libraryOwnerGroup = config.server.libraryOwner.group;
in {
  services.radarr = {
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

  services.caddy.virtualHosts."radarr.${config.server.network.domain}" = {
    extraConfig = ''
      import auth_proxy
      reverse_proxy localhost:${toString port} {
        header_down -Access-Control-Allow-Origin
      }
    '';
  };

  systemd.services.radarr.serviceConfig = {
    UMask = pkgs.lib.mkForce "002";
  };

  users.users.radarr.extraGroups = [libraryOwnerGroup];
}
