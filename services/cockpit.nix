{
  config,
  pkgs,
  lib,
  ...
}: let
  port = config.server.ports.cockpit;
  domain = "cockpit.${config.server.network.domain}";
in {
  services.cockpit = {
    enable = true;
    inherit port;

    settings = {
      WebService = {
        AllowUnencrypted = true;
        Origins = lib.mkForce "https://${domain}";
        ProtocolHeader = "X-Forwarded-Proto";
      };
    };
  };

  services.caddy.virtualHosts."${domain}" = {
    extraConfig = ''
      @cockpit_ws path /cockpit/socket/*
      reverse_proxy @cockpit_ws localhost:${toString port}

      import auth_proxy
      reverse_proxy localhost:${toString port}
    '';
  };
}
