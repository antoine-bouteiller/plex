{config, ...}: let
  dataDir = "${config.server.paths.app}/qBittorrent";
  port = config.server.ports.qbittorrent;
  mediaGroup = config.server.mediaGroup;
in {
  services.qbittorrent = {
    enable = true;
    profileDir = dataDir;
    group = mediaGroup;
  };

  services.caddy.virtualHosts."qbittorrent.${config.server.network.domain}" = {
    extraConfig = ''
      import auth_proxy
      reverse_proxy localhost:${toString port}
    '';
  };

  users.users.qbittorrent.extraGroups = [mediaGroup];

  systemd.services.qbittorrent.serviceConfig = {
    UMask = "002";
  };
}
