{...}: {
  imports = [
    ./authelia
    ./caddy
    ./plex
    ./jellyseerr
    ./qbittorrent
    ./bazarr
    ./sonarr
    ./radarr
    ./prowlarr
    ./homepage
  ];

  users.groups.media = {};
}
