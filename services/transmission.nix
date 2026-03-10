{globals, ...}: {
  services.transmission = {
    enable = true;
    group = globals.libraryOwner.group;
    openRPCPort = false;
    settings = {
      rpc-port = globals.transmission.port;
      rpc-bind-address = "127.0.0.1";
      rpc-host-whitelist-enabled = false;
      download-dir = "${globals.paths.mediaDir}/torrents";
      incomplete-dir-enabled = false;
      ratio-limit-enabled = true;
      ratio-limit = 0;
      umask = "002";
    };
  };

  services.caddy.virtualHosts."torrent.${globals.network.domain}" = {
    extraConfig = ''
      import auth_proxy
      reverse_proxy localhost:${toString globals.transmission.port}
    '';
  };
}
