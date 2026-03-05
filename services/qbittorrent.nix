{config, ...}: let
  dataDir = "${config.server.paths.app}/qBittorrent";
  port = config.server.ports.qbittorrent;
  libraryOwnerGroup = config.server.libraryOwner.group;
in {
  services.qbittorrent = {
    enable = true;
    profileDir = dataDir;
    group = libraryOwnerGroup;
  };

  services.caddy.virtualHosts."qbittorrent.${config.server.network.domain}" = {
    extraConfig = ''
      import auth_proxy
      reverse_proxy localhost:${toString port}
    '';
  };

  users.users.qbittorrent.extraGroups = [libraryOwnerGroup];

  systemd.services.qbittorrent.serviceConfig = {
    UMask = "002";
  };
}
