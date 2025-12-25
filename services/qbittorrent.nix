{config, ...}: {
  services.qbittorrent = {
    enable = true;
  };

  services.caddy.virtualHosts."qbittorrent.${config.server.domain}" = {
    extraConfig = ''
      import auth_proxy
      reverse_proxy localhost:8080
    '';
  };

  users.users.qbittorrent.extraGroups = ["media"];

  systemd.services.qbittorrent.serviceConfig = {
    Umask = 002;
  };
}
