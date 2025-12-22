{...}: {
  services.caddy = {
    enable = true;

    globalConfig = ''
      (auth_proxy) {
        forward_auth localhost:9091 {
          uri /api/authz/forward-auth
          copy_headers Remote-User Remote-Groups Remote-Email Remote-Name
          header_down -Authorization
        }
      }
    '';
  };
}
