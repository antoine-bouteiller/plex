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

  services.caddy.virtualHosts."bazarr.${config.server.network.domain}" = {
    extraConfig = ''
      import auth_proxy
      reverse_proxy localhost:${toString port}
    '';
  };

  users.users.bazarr.isSystemUser = true;
  users.users.bazarr.group = libraryOwnerGroup;
}
