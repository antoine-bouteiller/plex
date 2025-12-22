{config, ...}: {
  services.authelia.instances.main = {
    enable = true;

    secrets = {
      storageEncryptionKeyFile = "${config.env.appPath}/authelia-main/secrets/storage_encryption_key";
      sessionSecretFile = "${config.env.appPath}/authelia-main/secrets/session_secret";
      jwtSecretFile = "${config.env.appPath}/authelia-main/secrets/jwt_secret";
    };

    settings = {
      theme = "dark";

      server.endpoints.authz.forward-auth.implementation = "ForwardAuth";

      identity_validation.reset_password = {
        jwt_lifespan = "5 minutes";
        jwt_algorithm = "HS256";
      };

      authentication_backend.file = {
        path = "${config.env.appPath}/authelia-main/users.yml";
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
            domain = "*.${config.env.domain}";
            policy = "bypass";
            networks = ["internal"];
          }
          {
            domain = "*.${config.env.domain}";
            policy = "one_factor";
          }
        ];
      };

      session.cookies = [
        {
          name = "authelia_session";
          domain = config.env.domain;
          authelia_url = "https://auth.${config.env.domain}";
        }
      ];

      regulation = {
        max_retries = 3;
        find_time = "2 minutes";
        ban_time = "5 minutes";
      };

      storage.local.path = "${config.env.appPath}/authelia-main/db.sqlite3";

      notifier = {
        disable_startup_check = false;
        filesystem = {
          filename = "${config.env.appPath}/authelia-main/notification.txt";
        };
      };
    };
  };

  services.caddy.virtualHosts."auth.${config.env.domain}" = {
    extraConfig = "reverse_proxy localhost:9091";
  };
}
