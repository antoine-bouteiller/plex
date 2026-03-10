{config, globals, ...}: {
  users.users.autoscan.extraGroups = [globals.libraryOwner.group];

  services.autoscan = {
    enable = true;
    dataDir = globals.autoscan.dataDir;
    port = globals.autoscan.port;

    settings = {
      plexUrl = "http://localhost:${toString globals.plex.port}";
      domain = globals.network.domain;
      tmdbApiUrl = "https://api.themoviedb.org/3";
      sonarrApiUrl = "http://localhost:${toString globals.sonarr.port}";
      radarrApiUrl = "http://localhost:${toString globals.radarr.port}";
      transcodePath = "${globals.paths.mediaDir}/transcode";
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
    owner = globals.autoscan.user;
  };
  sops.secrets."autoscan/telegram_token" = {
    key = "telegram/token";
    owner = globals.autoscan.user;
    group = globals.autoscan.group;
  };
  sops.secrets."autoscan/telegram_chat_id" = {
    key = "telegram/chat_id";
    owner = globals.autoscan.user;
    group = globals.autoscan.group;
  };
  sops.secrets."autoscan/cloudflare_token" = {
    key = "cloudflare_token";
    owner = globals.autoscan.user;
    group = globals.autoscan.group;
  };
  sops.secrets."autoscan/tmdb_api_token" = {
    key = "tmdb_api_token";
    owner = globals.autoscan.user;
    group = globals.autoscan.group;
  };
  sops.secrets."autoscan/sonarr_api_key" = {
    key = "sonarr_api_key";
    owner = globals.autoscan.user;
    group = globals.autoscan.group;
  };
  sops.secrets."autoscan/radarr_api_key" = {
    key = "radarr_api_key";
    owner = globals.autoscan.user;
    group = globals.autoscan.group;
  };
  sops.secrets."autoscan/trakt_client_id" = {
    key = "trakt/client_id";
    owner = globals.autoscan.user;
    group = globals.autoscan.group;
  };
  sops.secrets."autoscan/trakt_client_secret" = {
    key = "trakt/client_secret";
    owner = globals.autoscan.user;
    group = globals.autoscan.group;
  };
}
