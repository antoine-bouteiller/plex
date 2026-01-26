{
  config,
  pkgs,
  ...
}: let
  port = config.server.ports.cockpit;
in {
  services.cockpit = {
    enable = true;
    inherit port;
  };

  services.caddy.virtualHosts."cockpit.${config.server.network.domain}" = {
    extraConfig = ''
      import auth_proxy
      reverse_proxy localhost:${toString port}
    '';
  };
}
