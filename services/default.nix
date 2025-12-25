{...}: {
  imports = [
    ./caddy.nix
    ./authelia.nix
    ./plex.nix
    ./jellyseerr.nix
    ./sonarr.nix
    ./radarr.nix
    ./prowlarr.nix
    ./bazarr.nix
    ./qbittorrent.nix
    ./recyclarr.nix
    ./homepage.nix
  ];
}
