{
  config,
  pkgs,
  ...
}: let
  dataDir = "${config.server.paths.app}/sonarr";
  port = config.server.ports.sonarr;
  libraryOwnerGroup = config.server.libraryOwner.group;
in {
  services.sonarr = {
    enable = true;
    inherit dataDir;
    group = libraryOwnerGroup;

    settings = {
      server.bindAddress = "*";
      auth.method = "external";
      postgres = {
        host = "/run/postgresql";
        port = 5432;
        user = "sonarr";
        mainDb = "sonarr";
        logDb = "sonarr-log";
      };
    };
  };

  services.caddy.virtualHosts."sonarr.${config.server.network.domain}" = {
    extraConfig = ''
      import auth_proxy
      reverse_proxy localhost:${toString port} {
        header_down -Access-Control-Allow-Origin
      }
    '';
  };

  services.postgresql = {
    ensureDatabases = ["sonarr" "sonarr-log"];
    ensureUsers = [
      {
        name = "sonarr";
      }
    ];
  };

  systemd.services.postgresql-setup.script = pkgs.lib.mkAfter ''
    psql -tAc "ALTER DATABASE \"sonarr\" OWNER TO sonarr"
    psql -tAc "ALTER DATABASE \"sonarr-log\" OWNER TO sonarr"
  '';

  systemd.services.sonarr = {
    after = ["postgresql-setup.service"];
    requires = ["postgresql-setup.service"];
    serviceConfig.UMask = pkgs.lib.mkForce "002";
  };

  users.users.sonarr.extraGroups = [libraryOwnerGroup];
}
