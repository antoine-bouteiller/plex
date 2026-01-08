{config, ...}: let
  dataDir = "${config.server.paths.app}/bazarr";
  port = config.server.ports.bazarr;
  mediaGroup = config.server.mediaGroup;
in {
  services.bazarr = {
    enable = true;
    group = mediaGroup;
    inherit dataDir;
  };

  services.caddy.virtualHosts."bazarr.${config.server.network.domain}" = {
    extraConfig = ''
      import auth_proxy
      reverse_proxy localhost:${toString port}
    '';
  };

  users.users.bazarr.isSystemUser = true;
  users.users.bazarr.group = mediaGroup;

  systemd.tmpfiles.rules = [
    "d ${dataDir} 0755 bazarr ${mediaGroup} - -"
  ];
}
