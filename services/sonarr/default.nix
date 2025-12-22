{config, ...}: {
  services.sonarr = {
    enable = true;
    dataDir = "${config.env.appPath}/sonarr";

    settings = {
      auth = {
        method = "external";
      };
    };
  };

  services.caddy.virtualHosts."sonarr.${config.env.domain}" = {
    extraConfig = ''
      import auth_proxy
      reverse_proxy localhost:8989 {
        header_down -Access-Control-Allow-Origin
      }
    '';
  };

  users.users.sonarr.extraGroups = ["media"];
}
