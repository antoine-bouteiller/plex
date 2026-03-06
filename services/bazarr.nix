{config, ...}: let
  dataDir = "${config.server.paths.app}/bazarr";
  port = config.server.ports.bazarr;
  libraryOwnerGroup = config.server.libraryOwner.group;
in {
  services.bazarr = {
    enable = true;
    group = libraryOwnerGroup;
    inherit dataDir;
  };

  services.postgresql = {
    ensureDatabases = ["bazarr"];
    ensureUsers = [
      {
        name = "bazarr";
        ensureDBOwnership = true;
      }
    ];
  };

  systemd.services.bazarr = {
    after = ["postgresql-setup.service"];
    requires = ["postgresql-setup.service"];
    environment = {
      POSTGRES_ENABLED = "true";
      POSTGRES_HOST = "/run/postgresql";
      POSTGRES_PORT = "5432";
      POSTGRES_DATABASE = "bazarr";
      POSTGRES_USERNAME = "bazarr";
    };
  };

  services.caddy.virtualHosts."bazarr.${config.server.network.domain}" = {
    extraConfig = ''
      import auth_proxy
      reverse_proxy localhost:${toString port}
    '';
  };

  users.users.bazarr.isSystemUser = true;
  users.users.bazarr.group = libraryOwnerGroup;
}
