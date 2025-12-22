{config, ...}: {
  services.homepage-dashboard = {
    enable = true;

    environmentFile = config.env.secretEnvFile;

    settings = {
      title = "Antoine's Dashboard";
      theme = "dark";
      useEqualHeights = true;
      headerStyle = "clean";
      layout = {
        Utilities = {
          header = false;
          style = "row";
          columns = 2;
        };
        Apps = {
          header = false;
          style = "row";
          columns = 2;
        };
      };
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
              href = "https://plex.${config.env.domain}";
              widget = {
                type = "plex";
                url = "http://localhost:32400";
                key = "{{HOMEPAGE_VAR_PLEX_TOKEN}}";
              };
            };
          }
          {
            Jellyseerr = {
              icon = "jellyseerr.svg";
              href = "https://${config.env.domain}";
            };
          }
          {
            Sonnar = {
              icon = "sonarr.svg";
              href = "https://sonarr.${config.env.domain}";
              widget = {
                type = "sonarr";
                url = "http://localhost:8989";
                key = "{{HOMEPAGE_VAR_SONARR_API_KEY}}";
                fields = ["wanted"];
              };
            };
          }
          {
            Radarr = {
              icon = "radarr.svg";
              href = "https://radarr.${config.env.domain}";
              widget = {
                type = "radarr";
                url = "http://localhost:7878";
                key = "{{HOMEPAGE_VAR_RADARR_API_KEY}}";
                fields = ["wanted"];
              };
            };
          }
          {
            Prowlarr = {
              icon = "prowlarr.svg";
              href = "https://prowlarr.${config.env.domain}";
              widget = {
                type = "prowlarr";
                url = "http://localhost:9696";
                key = "{{HOMEPAGE_VAR_PROWLARR_API_KEY}}";
                fields = ["numberOfFailGrabs" "numberOfFailQueries"];
              };
            };
          }
          {
            Bazarr = {
              icon = "bazarr.svg";
              href = "https://bazarr.${config.env.domain}";
              widget = {
                type = "bazarr";
                url = "http://localhost:5050";
                key = "{{HOMEPAGE_VAR_BAZARR_API_KEY}}";
              };
            };
          }
          {
            qBittorrent = {
              icon = "qbittorrent.svg";
              href = "https://qbittorrent.${config.env.domain}";
              widget = {
                type = "qbittorrent";
                url = "http://localhost:8080";
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

  services.caddy.virtualHosts."dashboard.${config.env.domain}" = {
    extraConfig = ''
      import auth_proxy
      reverse_proxy localhost:3000
    '';
  };
}
