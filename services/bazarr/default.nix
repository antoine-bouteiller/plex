{config, ...}: {
  services.bazarr = {
    enable = true;
    group = "media";
    dataDir = "${config.env.appPath}/bazarr";
  };

  services.caddy.virtualHosts."bazarr.${config.env.domain}" = {
    extraConfig = ''
      import auth_proxy
      reverse_proxy localhost:6767
    '';
  };

  users.users.bazarr.isSystemUser = true;
  users.users.bazarr.group = "media";
}
