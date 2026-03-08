{
  config,
  lib,
  ...
}: let
  dataDir = "${config.server.paths.app}/prowlarr";
  port = config.server.ports.prowlarr;
in {
  imports = ["./custom-def"];

  services.prowlarr = {
    enable = true;
    inherit dataDir;

    settings = {
      auth.method = "external";
      postgres = {
        host = "/run/postgresql";
        port = 5432;
        user = "prowlarr";
        mainDb = "prowlarr";
        logDb = "prowlarr-log";
      };
    };
  };

  services.postgresql = {
    ensureDatabases = ["prowlarr" "prowlarr-log"];
    ensureUsers = [
      {
        name = "prowlarr";
      }
    ];
  };

  systemd.services.postgresql-setup.script = lib.mkAfter ''
    psql -tAc "ALTER DATABASE \"prowlarr\" OWNER TO prowlarr"
    psql -tAc "ALTER DATABASE \"prowlarr-log\" OWNER TO prowlarr"
  '';

  systemd.services.prowlarr = {
    after = ["postgresql-setup.service"];
    requires = ["postgresql-setup.service"];
  };

  services.caddy.virtualHosts."prowlarr.${config.server.network.domain}" = {
    extraConfig = ''
      import auth_proxy
      reverse_proxy localhost:${toString port} {
        header_down -Access-Control-Allow-Origin
      }
    '';
  };
}
