let
  libraryOwnerGroup = "media";
  appDir = "/var/lib";
in {
  paths = {
    app = appDir;
    mediaDir = "/mnt/media";
  };

  network = {
    domain = "antoinebouteiller.fr";
  };

  libraryOwner = {
    user = "root";
    group = libraryOwnerGroup;
  };
  authelia = {
    port = 9091;
    dataDir = "${appDir}/authelia-main";
  };
  autoscan = {
    port = 3030;
    dataDir = "${appDir}/autoscan";
    user = "autoscan";
    group = "autoscan";
  };
  bazarr = {
    port = 6767;
    dataDir = "${appDir}/bazarr";
    user = "bazarr";
    group = libraryOwnerGroup;
  };
  coolercontrol = {
    port = 11987;
  };
  flaresolverr = {
    port = 8191;
  };
  homepage = {
    port = 8082;
  };
  immich = {
    port = 2283;
  };
  jellyseerr = {
    port = 5055;
    dataDir = "${appDir}/jellyseerr";
    user = "jellyseerr";
    group = "jellyseerr";
  };
  plex = {
    port = 32400;
    dataDir = "${appDir}/plex";
    user = "plex";
    group = libraryOwnerGroup;
  };
  prowlarr = {
    port = 9696;
    dataDir = "${appDir}/prowlarr";
    user = "prowlarr";
    group = "prowlarr";
  };
  radarr = {
    port = 7878;
    dataDir = "${appDir}/radarr";
    user = "radarr";
    group = libraryOwnerGroup;
  };
  recyclarr = {
    user = "recyclarr";
    group = "recyclarr";
  };
  sonarr = {
    port = 8989;
    dataDir = "${appDir}/sonarr";
    user = "sonarr";
    group = libraryOwnerGroup;
  };
  transmission = {
    port = 9092;
    peerPort = 51413;
    user = "transmission";
    group = libraryOwnerGroup;
  };
  ygege = {
    port = 8715;
  };
}
