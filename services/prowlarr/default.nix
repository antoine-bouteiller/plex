{config, ...}: {
  services.prowlarr = {
    enable = true;
    dataDir = "${config.env.appPath}/prowlarr";

    settings = {
      auth = {
        method = "external";
      };
    };
  };

  services.caddy.virtualHosts."prowlarr.${config.env.domain}" = {
    extraConfig = ''
      import auth_proxy
      reverse_proxy localhost:9696 {
        header_down -Access-Control-Allow-Origin
      }
    '';
  };

  users.users.prowlarr.isSystemUser = true;
  users.users.prowlarr.group = "media";
}
