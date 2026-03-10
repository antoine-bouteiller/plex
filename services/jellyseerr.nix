{globals, ...}: {
  services.jellyseerr = {
    enable = true;
    configDir = globals.jellyseerr.dataDir;
  };

  services.caddy.virtualHosts."${globals.network.domain}" = {
    extraConfig = "reverse_proxy localhost:${toString globals.jellyseerr.port}";
  };
}
