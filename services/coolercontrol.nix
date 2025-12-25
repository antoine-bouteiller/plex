{config, ...}: {
  programs.coolercontrol.enable = true;

  services.caddy.virtualHosts."coolercontrol.${config.server.domain}" = {
    extraConfig = ''
      import auth_proxy
      reverse_proxy localhost:11987
    '';
  };
}
