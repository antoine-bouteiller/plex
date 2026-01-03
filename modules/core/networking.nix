{config, ...}: {
  networking = {
    hostName = "plex-server";
    nameservers = ["1.1.1.1" "9.9.9.9"];
  };

  networking.firewall = {
    enable = true;
    allowedTCPPorts = [
      22 # SSH
      80 # HTTP (Caddy)
      443 # HTTPS (Caddy)
      32400 # Plex
      6881 # qBittorrent
    ];
    interfaces."podman0".allowedTCPPorts = [
      config.server.ports.sonarr
      config.server.ports.radarr
    ];
  };
}
