{
  pkgs,
  globals,
  ...
}: {
  services.radarr = {
    enable = true;
    dataDir = globals.radarr.dataDir;
    group = globals.libraryOwner.group;

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

  services.caddy.virtualHosts."radarr.${globals.network.domain}" = {
    extraConfig = ''
      import auth_proxy
      reverse_proxy localhost:${toString globals.radarr.port} {
        header_down -Access-Control-Allow-Origin
      }
    '';
  };

  services.postgresql = {
    ensureDatabases = ["radarr" "radarr-log"];
    ensureUsers = [
      {
        name = "radarr";
        ensureDBOwnership = true;
      }
    ];
  };

  systemd.services.postgresql-setup.script = pkgs.lib.mkAfter ''
    psql -tAc "ALTER DATABASE \"radarr-log\" OWNER TO radarr"
  '';

  systemd.services.radarr = {
    after = ["postgresql-setup.service"];
    requires = ["postgresql-setup.service"];
    serviceConfig.UMask = pkgs.lib.mkForce "002";
  };

  users.users.radarr.extraGroups = [globals.libraryOwner.group];
}
