{config, ...}: let
  dataDir = "${config.server.paths.app}/bazarr";
  port = config.server.ports.bazarr;
in {
  services.bazarr = {
    enable = true;
    group = "media";
    inherit dataDir;
  };

  services.caddy.virtualHosts."bazarr.${config.server.domain}" = {
    extraConfig = ''
      import auth_proxy
      reverse_proxy localhost:${toString port}
    '';
  };

  users.users.bazarr.isSystemUser = true;
  users.users.bazarr.group = "media";

  systemd.tmpfiles.rules = [
    "d ${dataDir} 0755 bazarr media - -"
  ];
}
