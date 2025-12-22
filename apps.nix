{
  config,
  pkgs,
  ...
}: let
  mkContainer = {
    image,
    volumes ? [],
    env ? {},
    extra ? [],
    dependsOn ? [],
  }: {
    inherit image volumes dependsOn;
    environment = {
      PUID = "1000";
      PGID = "1000";
      TZ = "Europe/Paris";
    };
    environmentFiles = [config.env.secretEnvFile];
    extraOptions = ["--log-driver=json-file" "--log-opt=max-size=1m" "--log-opt=max-file=1"] ++ extra;
    autoStart = true;
  };
in {
  # --- 1. NATIVE PLEX SERVICE ---
  services.plex = {
    enable = true;
    openFirewall = true;
    user = config.env.user;
    dataDir = "${config.env.appPath}/plex";
  };

  hardware.graphics = {
    enable = true;
    extraPackages = [pkgs.intel-media-driver];
  };

  # Use Docker backend explicitly
  virtualisation.oci-containers.backend = "docker";

  # --- 3. THE FULL CONTAINER STACK ---
  virtualisation.oci-containers.containers = {
    sonarr = mkContainer {
      image = "lscr.io/linuxserver/sonarr:latest";
      env = {SONARR__AUTH__METHOD = "External";};
      volumes = ["${config.env.appPath}/sonarr:/config" "${config.env.dataPath}:/mnt/data"];
      dependsOn = ["prowlarr" "qbittorrent"];
    };

    radarr = mkContainer {
      image = "lscr.io/linuxserver/radarr:latest";
      env = {RADARR__AUTH__METHOD = "External";};
      volumes = ["${config.env.appPath}/radarr:/config" "${config.env.dataPath}:/mnt/data" "${config.env.moviesPath}:/mnt/movies"];
      dependsOn = ["prowlarr" "qbittorrent"];
    };

    prowlarr = mkContainer {
      image = "lscr.io/linuxserver/prowlarr:latest";
      env = {PRWOLARR__AUTH__METHOD = "External";};
      volumes = ["${config.env.appPath}/prowlarr:/config"];
      dependsOn = ["flaresolverr"];
    };

    bazarr = mkContainer {
      image = "lscr.io/linuxserver/bazarr:latest";
      volumes = ["${config.env.appPath}/bazarr:/config" "${config.env.dataPath}:/mnt/data" "${config.env.moviesPath}:/mnt/movies"];
    };

    qbittorrent = mkContainer {
      image = "lscr.io/linuxserver/qbittorrent:latest";
      env = {
        WEBUI_PORT = "8080";
        TORRENTING_PORT = "6881";
      };
      volumes = ["${config.env.appPath}/qbittorrent:/config" "${config.env.dataPath}/torrents:/downloads"];
      extra = ["-p 6881:6881" "-p 8080:8080"];
    };

    flaresolverr = mkContainer {
      image = "ghcr.io/flaresolverr/flaresolverr:latest";
    };

    autoscan = mkContainer {
      image = "antobouteiller/autoscan:latest";
      env = {DOMAIN = config.env.domain;};
      volumes = ["${config.env.appPath}/autoscan:/autoscan/resources" "${config.env.dataPath}:/mnt/data"];
    };

    jellyseerr = mkContainer {
      image = "fallenbagel/jellyseerr:latest";
      volumes = ["${config.env.appPath}/jellyseerr:/app/config"];
      dependsOn = ["sonarr" "radarr"];
    };

    homepage = mkContainer {
      image = "ghcr.io/gethomepage/homepage:latest";
      env = {
        HOMEPAGE_ALLOWED_HOSTS = "dashboard.${config.env.domain}";
        HOMEPAGE_VAR_DOMAIN = config.env.domain;
      };
      volumes = [
        "${config.env.configsPath}/homepage:/app/config:ro" # Your yaml configs
        "${config.env.appPath}/homepage:/app/config/data"
        "/var/run/docker.sock:/var/run/docker.sock:ro"
        "${config.env.dataPath}:/mnt/data:ro"
      ];
    };

    authelia = mkContainer {
      image = "docker.io/authelia/authelia:latest";
      env = {
        X_AUTHELIA_CONFIG_FILTERS = "template";
        DOMAIN = config.env.domain;
      };
      volumes = ["${config.env.configsPath}/authelia:/config" "${config.env.appPath}/authelia:/config/data"];
    };

    dozzle = mkContainer {
      image = "amir20/dozzle:latest";
      volumes = ["/var/run/docker.sock:/var/run/docker.sock"];
    };
  };
}
