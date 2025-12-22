{config, ...}: {
  services.jellyseerr = {
    enable = true;
    configDir = "${config.env.appPath}/jellyseerr";
  };

  services.caddy.virtualHosts."${config.env.domain}" = {
    extraConfig = "reverse_proxy localhost:5055";
  };

  users.users.jellyseerr.isSystemUser = true;
  users.users.jellyseerr.group = "media";
}
