{lib, ...}:
with lib; {
  options.server = mkOption {
    type = types.attrs;
    description = "Server configuration";
    default = {};
  };

  config.server = {
    mediaGroup = "media";

    paths = {
      app = "/var/lib";
      data = "/mnt/data";
      movies = "/mnt/movies";
    };

    network = {
      domain = "antoinebouteiller.fr";
      containerHost = "host.containers.internal";
    };

    ports = {
      plex = 32400;
      sonarr = 8989;
      radarr = 7878;
      prowlarr = 9696;
      bazarr = 6767;
      jellyseerr = 5055;
      qbittorrent = 8080;
      flaresolverr = 8191;
      authelia = 9091;
      homepage = 8082;
      coolercontrol = 11987;
      autoscan = 3030;
    };
  };
}
