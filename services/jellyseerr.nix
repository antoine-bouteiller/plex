{config, ...}: {
  services.jellyseerr = {
    enable = true;
    configDir = "${config.server.paths.app}/jellyseerr";
  };

  services.caddy.virtualHosts."${config.server.domain}" = {
    extraConfig = "reverse_proxy localhost:5055";
  };
}
