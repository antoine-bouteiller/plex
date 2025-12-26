{lib, ...}: let
  mkPortOption = port: description:
    lib.mkOption {
      type = lib.types.port;
      default = port;
      description = "${description} port";
    };
in {
  options.server = {
    paths = {
      app = lib.mkOption {
        type = lib.types.str;
        default = "/var/lib";
        description = "Application data directory (for databases, state files, etc.)";
      };

      data = lib.mkOption {
        type = lib.types.str;
        default = "/mnt/data";
        description = "Media data mount path";
      };

      movies = lib.mkOption {
        type = lib.types.str;
        default = "/mnt/movies";
        description = "Movies mount path";
      };
    };

    domain = lib.mkOption {
      type = lib.types.str;
      default = "antoinebouteiller.fr";
      description = "Primary domain name for services";
    };

    ports = {
      plex = mkPortOption 32400 "Plex Media Server";
      sonarr = mkPortOption 8989 "Sonarr";
      radarr = mkPortOption 7878 "Radarr";
      prowlarr = mkPortOption 9696 "Prowlarr";
      bazarr = mkPortOption 6767 "Bazarr";
      jellyseerr = mkPortOption 5055 "Jellyseerr";
      qbittorrent = mkPortOption 8080 "qBittorrent";
      flaresolverr = mkPortOption 8191 "FlareSolverr";
      authelia = mkPortOption 9091 "Authelia";
      homepage = mkPortOption 8082 "Homepage Dashboard";
      coolercontrol = mkPortOption 11987 "CoolerControl";
      autoscan = mkPortOption 3030 "Autoscan";
    };
  };
}
