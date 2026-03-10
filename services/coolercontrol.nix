{globals, ...}: {
  programs.coolercontrol.enable = true;

  services.caddy.virtualHosts."coolercontrol.${globals.network.domain}" = {
    extraConfig = ''
      import auth_proxy
      reverse_proxy localhost:${toString globals.coolercontrol.port}
    '';
  };
}
