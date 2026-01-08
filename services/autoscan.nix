{config, ...}: let
  user = "autoscan";
  group = "autoscan";
  dataDir = "${config.server.paths.app}/autoscan";
  port = config.server.ports.autoscan;
  plexPort = config.server.ports.plex;
  sonarrPort = config.server.ports.sonarr;
  radarrPort = config.server.ports.radarr;
  containerHost = config.server.network.containerHost;
  mediaGroup = config.server.mediaGroup;
in {
  users.users.${user} = {
    isSystemUser = true;
    group = group;
    extraGroups = [mediaGroup];
  };
  users.groups.${group} = {};

  virtualisation.oci-containers = {
    backend = "podman";
    containers.autoscan = {
      image = "antobouteiller/autoscan:latest";
      ports = ["${toString port}:${toString port}"];
      user = "${toString config.users.users.${user}.uid}:${toString config.users.groups.${group}.gid}";
      environmentFiles = [config.sops.templates."autoscan.env".path];
      volumes = [
        "${dataDir}:/autoscan/resources"
        "${config.server.paths.data}:/mnt/data"
      ];
    };
  };

  sops.secrets."autoscan/plex_token" = {
    key = "plex_token";
  };
  sops.secrets."autoscan/telegram_token" = {
    key = "telegram/token";
  };
  sops.secrets."autoscan/telegram_chat_id" = {
    key = "telegram/chat_id";
  };
  sops.secrets."autoscan/cloudflare_token" = {
    key = "cloudflare_token";
  };
  sops.secrets."autoscan/tmdb_api_token" = {
    key = "tmdb_api_token";
  };
  sops.secrets."autoscan/sonarr_api_key" = {
    key = "sonarr_api_key";
  };
  sops.secrets."autoscan/radarr_api_key" = {
    key = "radarr_api_key";
  };

  sops.templates."autoscan.env" = {
    owner = user;
    group = group;
    content = ''
      PLEX_TOKEN=${config.sops.placeholder."autoscan/plex_token"}
      PLEX_URL=http://${containerHost}:${toString plexPort}
      DOMAIN=${config.server.network.domain}
      TELEGRAM_TOKEN=${config.sops.placeholder."autoscan/telegram_token"}
      TELEGRAM_CHAT_ID=${config.sops.placeholder."autoscan/telegram_chat_id"}
      CLOUDFLARE_TOKEN=${config.sops.placeholder."autoscan/cloudflare_token"}
      TMDB_API_TOKEN=${config.sops.placeholder."autoscan/tmdb_api_token"}
      TMDB_API_URL=https://api.themoviedb.org/3
      SONARR_API_URL=http://${containerHost}:${toString sonarrPort}
      SONARR_API_KEY=${config.sops.placeholder."autoscan/sonarr_api_key"}
      RADARR_API_URL=http://${containerHost}:${toString radarrPort}
      RADARR_API_KEY=${config.sops.placeholder."autoscan/radarr_api_key"}
    '';
  };

  systemd.tmpfiles.rules = [
    "d ${dataDir} 0755 ${user} ${group} - -"
  ];
}
