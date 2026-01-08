{config, ...}: let
  dataDir = "${config.server.paths.app}/plex";
  port = config.server.ports.plex;
  mediaGroup = config.server.mediaGroup;
in {
  services.plex = {
    enable = true;
    inherit dataDir;
  };

  services.caddy.virtualHosts."plex.${config.server.network.domain}" = {
    extraConfig = "reverse_proxy localhost:${toString port}";
  };

  users.users.plex.extraGroups = [mediaGroup];

  systemd.tmpfiles.rules = [
    "d ${dataDir} 0755 plex plex - -"
  ];
}
