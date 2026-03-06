{
  config,
  pkgs,
  ...
}: let
  dataDir = "${config.server.paths.app}/radarr";
  port = config.server.ports.radarr;
  libraryOwnerGroup = config.server.libraryOwner.group;
in {
  services.radarr = {
    enable = true;
    inherit dataDir;
    group = libraryOwnerGroup;

    settings = {
      server.bindAddress = "*";
      auth.method = "external";
      postgres = {
        host = "/run/postgresql";
        port = 5432;
        user = "radarr";
        mainDb = "radarr";
        logDb = "radarr-log";
      };
    };
  };

  services.caddy.virtualHosts."radarr.${config.server.network.domain}" = {
    extraConfig = ''
      import auth_proxy
      reverse_proxy localhost:${toString port} {
        header_down -Access-Control-Allow-Origin
      }
    '';
  };

  services.postgresql = {
    ensureDatabases = ["radarr" "radarr-log"];
    ensureUsers = [
      {
        name = "radarr";
      }
    ];
  };

  systemd.services.postgresql-setup.script = pkgs.lib.mkAfter ''
    psql -tAc "ALTER DATABASE \"radarr\" OWNER TO radarr"
    psql -tAc "ALTER DATABASE \"radarr-log\" OWNER TO radarr"
  '';

  systemd.services.radarr = {
    after = ["postgresql-setup.service"];
    requires = ["postgresql-setup.service"];
    serviceConfig.UMask = pkgs.lib.mkForce "002";
  };

  users.users.radarr.extraGroups = [libraryOwnerGroup];
}
