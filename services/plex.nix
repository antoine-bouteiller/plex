{config, ...}: {
  services.plex = {
    enable = true;
    dataDir = "${config.server.paths.app}/plex";
  };

  services.caddy.virtualHosts."plex.${config.server.domain}" = {
    extraConfig = "reverse_proxy localhost:32400";
  };

  users.users.plex.extraGroups = ["media"];
}
