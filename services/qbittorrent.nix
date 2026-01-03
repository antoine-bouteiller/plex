{config, ...}: let
  dataDir = "${config.server.paths.app}/qBittorrent";
  port = config.server.ports.qbittorrent;
in {
  services.qbittorrent = {
    enable = true;
    profileDir = dataDir;

    group = "media";
  };

  services.caddy.virtualHosts."qbittorrent.${config.server.domain}" = {
    extraConfig = ''
      import auth_proxy
      reverse_proxy localhost:${toString port}
    '';
  };

  users.users.qbittorrent.extraGroups = ["media"];

  systemd.services.qbittorrent.serviceConfig = {
    Umask = 002;
  };

  systemd.tmpfiles.rules = [
    "d ${dataDir} 0755 qbittorrent qbittorrent - -"
  ];
}
