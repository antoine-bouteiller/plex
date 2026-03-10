{globals, ...}: {
  services.plex = {
    enable = true;
    dataDir = globals.plex.dataDir;
  };

  services.caddy.virtualHosts."plex.${globals.network.domain}" = {
    extraConfig = ''
      reverse_proxy localhost:${toString globals.plex.port} {
          header_up Host {host}
          header_up X-Real-IP {remote_host}
          header_up X-Forwarded-For {remote_host}
          header_up X-Forwarded-Proto {scheme}
      }
    '';
  };

  users.users.plex.extraGroups = [globals.libraryOwner.group];
}
