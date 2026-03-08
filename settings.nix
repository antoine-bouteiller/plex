{lib, ...}:
with lib; {
  options.server = mkOption {
    type = types.attrs;
    description = "Server configuration";
  };

  config.server = {
    libraryOwner = {
      user = "root";
      group = "media";
    };

    paths = {
      app = "/var/lib";
      mediaDir = "/mnt/media";
    };

    network = {
      domain = "antoinebouteiller.fr";
    };

    ports = {
      plex = 32400;
      sonarr = 8989;
      radarr = 7878;
      prowlarr = 9696;
      bazarr = 6767;
      jellyseerr = 5055;
      transmission = 9092;
      flaresolverr = 8191;
      authelia = 9091;
      homepage = 8082;
      coolercontrol = 11987;
      autoscan = 3030;
      ygege = 8715;
    };
  };
}
