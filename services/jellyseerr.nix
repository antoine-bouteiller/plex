{config, ...}: let
  configDir = "${config.server.paths.app}/jellyseerr";
  port = config.server.ports.jellyseerr;
in {
  services.jellyseerr = {
    enable = true;
    inherit configDir;
  };

  services.caddy.virtualHosts."${config.server.network.domain}" = {
    extraConfig = "reverse_proxy localhost:${toString port}";
  };
}
