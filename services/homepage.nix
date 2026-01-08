{config, ...}: let
  port = config.server.ports.homepage;
  plexPort = config.server.ports.plex;
  sonarrPort = config.server.ports.sonarr;
  radarrPort = config.server.ports.radarr;
  prowlarrPort = config.server.ports.prowlarr;
  bazarrPort = config.server.ports.bazarr;
  qbittorrentPort = config.server.ports.qbittorrent;
in {
  sops.secrets = {
    "homepage/sonarr_api_key" = {
      key = "sonarr_api_key";
      owner = "homepage-dashboard";
      group = "homepage-dashboard";
    };
    "homepage/radarr_api_key" = {
      key = "radarr_api_key";
      owner = "homepage-dashboard";
      group = "homepage-dashboard";
    };
    "homepage/prowlarr_api_key" = {
      key = "prowlarr_api_key";
      owner = "homepage-dashboard";
      group = "homepage-dashboard";
    };
    "homepage/bazarr_api_key" = {
      key = "bazarr_api_key";
      owner = "homepage-dashboard";
      group = "homepage-dashboard";
    };
    "homepage/plex_token" = {
      key = "plex_token";
      owner = "homepage-dashboard";
      group = "homepage-dashboard";
    };
  };

  users.users.homepage-dashboard = {
    isSystemUser = true;
    group = "homepage-dashboard";
  };
  users.groups.homepage-dashboard = {};

  services.homepage-dashboard = {
    enable = true;
    allowedHosts = "dashboard.${config.server.network.domain}";
    settings = {
      title = "Antoine's Dashboard";
      theme = "dark";
      useEqualHeights = true;
      headerStyle = "clean";
      layout = [
        {
          Utilities = {
            header = false;
            style = "row";
            columns = 2;
          };
        }
        {
          Apps = {
            header = false;
            style = "row";
            columns = 2;
          };
        }
      ];
    };

    bookmarks = [
      {
        Utilities = [
          {
            Trashguide = [
              {
                icon = "trash-guides.png";
                href = "https://trash-guides.info";
              }
            ];
          }
          {
            Cloudflare = [
              {
                icon = "cloudflare.svg";
                href = "https://dash.cloudflare.com";
              }
            ];
          }
        ];
      }
    ];

    services = [
      {
        Apps = [
          {
            Plex = {
              icon = "plex.svg";
              href = "https://plex.${config.server.network.domain}";
              widget = {
                type = "plex";
                url = "http://localhost:${toString plexPort}";
                key = "{{HOMEPAGE_FILE_PLEX_TOKEN}}";
              };
            };
          }
          {
            Jellyseerr = {
              icon = "jellyseerr.svg";
              href = "https://${config.server.network.domain}";
            };
          }
          {
            Sonnar = {
              icon = "sonarr.svg";
              href = "https://sonarr.${config.server.network.domain}";
              widget = {
                type = "sonarr";
                url = "http://localhost:${toString sonarrPort}";
                key = "{{HOMEPAGE_FILE_SONARR_API_KEY}}";
                fields = ["wanted"];
              };
            };
          }
          {
            Radarr = {
              icon = "radarr.svg";
              href = "https://radarr.${config.server.network.domain}";
              widget = {
                type = "radarr";
                url = "http://localhost:${toString radarrPort}";
                key = "{{HOMEPAGE_FILE_RADARR_API_KEY}}";
                fields = ["wanted"];
              };
            };
          }
          {
            Prowlarr = {
              icon = "prowlarr.svg";
              href = "https://prowlarr.${config.server.network.domain}";
              widget = {
                type = "prowlarr";
                url = "http://localhost:${toString prowlarrPort}";
                key = "{{HOMEPAGE_FILE_PROWLARR_API_KEY}}";
                fields = ["numberOfFailGrabs" "numberOfFailQueries"];
              };
            };
          }
          {
            Bazarr = {
              icon = "bazarr.svg";
              href = "https://bazarr.${config.server.network.domain}";
              widget = {
                type = "bazarr";
                url = "http://localhost:${toString bazarrPort}";
                key = "{{HOMEPAGE_FILE_BAZARR_API_KEY}}";
              };
            };
          }
          {
            qBittorrent = {
              icon = "qbittorrent.svg";
              href = "https://qbittorrent.${config.server.network.domain}";
              widget = {
                type = "qbittorrent";
                url = "http://localhost:${toString qbittorrentPort}";
                fields = ["download" "upload"];
              };
            };
          }
        ];
      }
    ];

    widgets = [
      {
        resources = {
          label = "System";
          cpu = true;
          memory = true;
        };
      }
      {
        resources = {
          label = "Storage";
          disk = ["/" "/mnt/data"];
        };
      }
    ];
  };

  systemd.services.homepage-dashboard.serviceConfig = {
    User = "homepage-dashboard";
    Group = "homepage-dashboard";
  };

  systemd.services.homepage-dashboard.environment = {
    HOMEPAGE_FILE_PLEX_TOKEN = config.sops.secrets."homepage/plex_token".path;
    HOMEPAGE_FILE_SONARR_API_KEY = config.sops.secrets."homepage/sonarr_api_key".path;
    HOMEPAGE_FILE_RADARR_API_KEY = config.sops.secrets."homepage/radarr_api_key".path;
    HOMEPAGE_FILE_PROWLARR_API_KEY = config.sops.secrets."homepage/prowlarr_api_key".path;
    HOMEPAGE_FILE_BAZARR_API_KEY = config.sops.secrets."homepage/bazarr_api_key".path;
  };

  services.caddy.virtualHosts."dashboard.${config.server.network.domain}" = {
    extraConfig = ''
      import auth_proxy
      reverse_proxy localhost:${toString port}
    '';
  };
}
