{
  pkgs,
  globals,
  ...
}: {
  services.sonarr = {
    enable = true;
    dataDir = globals.sonarr.dataDir;
    group = globals.libraryOwner.group;

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

  services.caddy.virtualHosts."sonarr.${globals.network.domain}" = {
    extraConfig = ''
      import auth_proxy
      reverse_proxy localhost:${toString globals.sonarr.port} {
        header_down -Access-Control-Allow-Origin
      }
    '';
  };

  services.postgresql = {
    ensureDatabases = ["sonarr" "sonarr-log"];
    ensureUsers = [
      {
        name = "sonarr";
        ensureDBOwnership = true;
      }
    ];
  };

  systemd.services.postgresql-setup.script = pkgs.lib.mkAfter ''
    psql -tAc "ALTER DATABASE \"sonarr-log\" OWNER TO sonarr"
  '';

  systemd.services.sonarr = {
    after = ["postgresql-setup.service"];
    requires = ["postgresql-setup.service"];
    serviceConfig.UMask = pkgs.lib.mkForce "002";
  };

  users.users.sonarr.extraGroups = [globals.libraryOwner.group];
}
