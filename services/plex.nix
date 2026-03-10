{globals, ...}: {
  services.plex = {
    enable = true;
    dataDir = globals.plex.dataDir;
  };

  services.caddy.virtualHosts."plex.${globals.network.domain}" = {
    extraConfig = "reverse_proxy localhost:${toString globals.plex.port}";
  };

  users.users.plex.extraGroups = [globals.libraryOwner.group];
}
