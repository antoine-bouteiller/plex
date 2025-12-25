{config, ...}: {
  sops.secrets = {
    "authelia/jwt_secret" = {
      owner = "authelia-main";
      group = "authelia-main";
    };
    "authelia/storage_encryption_key" = {
      owner = "authelia-main";
      group = "authelia-main";
    };
    "authelia/session_secret" = {
      owner = "authelia-main";
      group = "authelia-main";
    };
  };

  services.authelia.instances.main = {
    enable = true;

    secrets = {
      storageEncryptionKeyFile = config.sops.secrets."authelia/storage_encryption_key".path;
      sessionSecretFile = config.sops.secrets."authelia/session_secret".path;
      jwtSecretFile = config.sops.secrets."authelia/jwt_secret".path;
    };

    settings = {
      theme = "dark";

      server.endpoints.authz.forward-auth.implementation = "ForwardAuth";

      identity_validation.reset_password = {
        jwt_lifespan = "5 minutes";
        jwt_algorithm = "HS256";
      };

      authentication_backend.file = {
        path = "${config.server.paths.app}/authelia-main/users.yml";
        password.algorithm = "argon2";
      };

      password_policy.zxcvbn = {
        enabled = true;
        min_score = 3;
      };

      access_control = {
        default_policy = "deny";

        networks = [
          {
            name = "internal";
            networks = [
              "10.0.0.0/8"
              "172.16.0.0/12"
              "192.168.0.0/18"
            ];
          }
        ];

        rules = [
          {
            domain = "*.${config.server.domain}";
            policy = "bypass";
            networks = ["internal"];
          }
          {
            domain = "*.${config.server.domain}";
            policy = "one_factor";
          }
        ];
      };

      session.cookies = [
        {
          name = "authelia_session";
          domain = config.server.domain;
          authelia_url = "https://auth.${config.server.domain}";
        }
      ];

      regulation = {
        max_retries = 3;
        find_time = "2 minutes";
        ban_time = "5 minutes";
      };

      storage.local.path = "${config.server.paths.app}/authelia-main/db.sqlite3";

      notifier = {
        disable_startup_check = false;
        filesystem = {
          filename = "${config.server.paths.app}/authelia-main/notification.txt";
        };
      };
    };
  };

  services.caddy.virtualHosts."auth.${config.server.domain}" = {
    extraConfig = "reverse_proxy localhost:9091";
  };
}
