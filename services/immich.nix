{
  config,
  pkgs,
  ...
}: let
  port = config.server.ports.immich;
  mediaDir = config.server.paths.mediaDir;
  libraryOwnerGroup = config.server.libraryOwner.group;
in {
  services.immich = {
    enable = true;
    inherit port;
    mediaLocation = "${mediaDir}/immich";

    database = {
      enable = true;
      createDB = false;
      host = "/run/postgresql";
      port = 5432;
      name = "immich";
      user = "immich";
    };
  };

  services.caddy.virtualHosts."immich.${config.server.network.domain}" = {
    extraConfig = ''
      import auth_proxy
      reverse_proxy localhost:${toString port}
    '';
  };

  services.postgresql = {
    ensureDatabases = ["immich"];
    ensureUsers = [
      {
        name = "immich";
      }
    ];
  };

  systemd.services.postgresql-setup.script = pkgs.lib.mkAfter ''
    psql -tAc "ALTER DATABASE \"immich\" OWNER TO immich"
    psql -d immich -tAc "CREATE EXTENSION IF NOT EXISTS vectors"
    psql -d immich -tAc "ALTER SCHEMA vectors OWNER TO immich"
  '';

  systemd.services.immich-server = {
    after = ["postgresql-setup.service"];
    requires = ["postgresql-setup.service"];
  };

  users.users.immich.extraGroups = [libraryOwnerGroup];
}
