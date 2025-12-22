{config, ...}: {
  services.plex = {
    enable = true;
    dataDir = "${config.env.appPath}/plex";
  };

  services.caddy.virtualHosts."plex.${config.env.domain}" = {
    extraConfig = "reverse_proxy localhost:32400";
  };

  users.users.plex.extraGroups = ["media"];
}
