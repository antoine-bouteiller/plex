{config, ...}: let
  user = "autoscan";
  port = config.server.ports.autoscan;
  plexPort = config.server.ports.plex;
  sonarrPort = config.server.ports.sonarr;
  radarrPort = config.server.ports.radarr;
  mediaGroup = config.server.mediaGroup;
in {
  services.autoscan = {
    enable = true;
    dataDir = "${config.server.paths.app}/autoscan";

    group = mediaGroup;

    inherit port;
    settings = {
      plexUrl = "http://localhost:${toString plexPort}";
      domain = config.server.network.domain;
      tmdbApiUrl = "https://api.themoviedb.org/3";
      sonarrApiUrl = "http://localhost:${toString sonarrPort}";
      radarrApiUrl = "http://localhost:${toString radarrPort}";
    };
    secrets = {
      plexTokenFile = config.sops.secrets."autoscan/plex_token".path;
      telegramTokenFile = config.sops.secrets."autoscan/telegram_token".path;
      telegramChatIdFile = config.sops.secrets."autoscan/telegram_chat_id".path;
      cloudflareTokenFile = config.sops.secrets."autoscan/cloudflare_token".path;
      tmdbApiTokenFile = config.sops.secrets."autoscan/tmdb_api_token".path;
      sonarrApiKeyFile = config.sops.secrets."autoscan/sonarr_api_key".path;
      radarrApiKeyFile = config.sops.secrets."autoscan/radarr_api_key".path;
      traktClientIdFile = config.sops.secrets."autoscan/trakt_client_id".path;
      traktClientSecretFile = config.sops.secrets."autoscan/trakt_client_secret".path;
    };
  };

  sops.secrets."autoscan/plex_token" = {
    key = "plex_token";
    owner = user;
  };
  sops.secrets."autoscan/telegram_token" = {
    key = "telegram/token";
    owner = user;
  };
  sops.secrets."autoscan/telegram_chat_id" = {
    key = "telegram/chat_id";
    owner = user;
  };
  sops.secrets."autoscan/cloudflare_token" = {
    key = "cloudflare_token";
    owner = user;
  };
  sops.secrets."autoscan/tmdb_api_token" = {
    key = "tmdb_api_token";
    owner = user;
  };
  sops.secrets."autoscan/sonarr_api_key" = {
    key = "sonarr_api_key";
    owner = user;
  };
  sops.secrets."autoscan/radarr_api_key" = {
    key = "radarr_api_key";
    owner = user;
  };
  sops.secrets."autoscan/trakt_client_id" = {
    key = "trakt/client_id";
    owner = user;
  };
  sops.secrets."autoscan/trakt_client_secret" = {
    key = "trakt/client_secret";
    owner = user;
  };
}
