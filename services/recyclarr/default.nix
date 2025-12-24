{config, ...}: {
  sops.secrets = {
    "recyclarr/sonarr_api_key" = {
      owner = "recylarr";
      group = "recylarr";
      key = "sonarr_api_key";
    };
    "recyclarr/radarr_api_key" = {
      owner = "recylarr";
      group = "recylarr";
      key = "radarr_api_key";
    };
  };

  services.recyclarr = {
    enable = true;

    settings = {
      sonarr = {
        sonarr = {
          base_url = "http://localhost:8989";
          api_key = {
            _secret = config.sops.secrets."recyclarr/sonarr_api_key".path;
          };

          delete_old_custom_formats = true;
          replace_existing_custom_formats = true;

          include = [
            {template = "sonarr-v4-quality-profile-web-1080p";}
            {template = "sonarr-v4-custom-formats-web-1080p";}
            {template = "sonarr-v4-quality-profile-anime";}
            {template = "sonarr-v4-custom-formats-anime";}
          ];

          custom_formats = [
            {
              trash_ids = ["47435ece6b99a0b477caf360e79ba0bb"]; # x265 (HD)
              assign_scores_to = [
                {
                  name = "WEB-1080p";
                  score = 0;
                }
              ];
            }
          ];
        };
      };

      radarr = {
        radarr = {
          base_url = "http://localhost:7878";
          api_key = {
            _secret = config.sops.secrets."recyclarr/radarr_api_key".path;
          };

          delete_old_custom_formats = true;
          replace_existing_custom_formats = true;

          quality_profiles = [
            {
              name = "SQP-1 WEB (1080p)";
              min_format_score = 10;
            }
          ];

          include = [
            {template = "radarr-quality-profile-sqp-1-web-1080p";}
            {template = "radarr-custom-formats-sqp-1-web-1080p";}
          ];

          custom_formats = [
            {
              trash_ids = ["dc98083864ea246d05a42df0d05f81cc"]; # x265 (HD)
              assign_scores_to = [
                {
                  name = "SQP-1 WEB (1080p)";
                  score = 0;
                }
              ];
            }
          ];
        };
      };
    };
  };
}
