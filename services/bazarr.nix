{config, ...}: {
  services.bazarr = {
    enable = true;
    group = "media";
    dataDir = "${config.server.paths.app}/bazarr";
  };

  services.caddy.virtualHosts."bazarr.${config.server.domain}" = {
    extraConfig = ''
      import auth_proxy
      reverse_proxy localhost:6767
    '';
  };

  users.users.bazarr.isSystemUser = true;
  users.users.bazarr.group = "media";
}
