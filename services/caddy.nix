{config, ...}: let
  autheliaPort = config.server.ports.authelia;
in {
  services.caddy = {
    enable = true;

    extraConfig = ''
      (auth_proxy) {
        forward_auth localhost:${toString autheliaPort} {
          uri /api/authz/forward-auth
          copy_headers Remote-User Remote-Groups Remote-Email Remote-Name
          header_down -Authorization
        }
      }
    '';
  };
}
