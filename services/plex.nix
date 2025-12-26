{config, ...}: let
  dataDir = "${config.server.paths.app}/plex";
  port = config.server.ports.plex;
in {
  services.plex = {
    enable = true;
    inherit dataDir;
  };

  services.caddy.virtualHosts."plex.${config.server.domain}" = {
    extraConfig = "reverse_proxy localhost:${toString port}";
  };

  users.users.plex.extraGroups = ["media"];

  systemd.tmpfiles.rules = [
    "d ${dataDir} 0755 plex plex - -"
  ];
}
