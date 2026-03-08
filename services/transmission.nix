{config, ...}: let
  port = config.server.ports.transmission;
  mediaDir = config.server.paths.mediaDir;
  libraryOwnerGroup = config.server.libraryOwner.group;
in {
  services.transmission = {
    enable = true;
    group = libraryOwnerGroup;
    openRPCPort = false;
    settings = {
      rpc-port = port;
      rpc-bind-address = "127.0.0.1";
      rpc-host-whitelist-enabled = false;
      download-dir = "${mediaDir}/torrents";
      incomplete-dir-enabled = false;
      ratio-limit-enabled = true;
      ratio-limit = 0;
      umask = "002";
    };
  };

  services.caddy.virtualHosts."torrent.${config.server.network.domain}" = {
    extraConfig = ''
      import auth_proxy
      reverse_proxy localhost:${toString port}
    '';
  };
}
