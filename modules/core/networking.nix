{...}: {
  networking = {
    hostName = "plex-server";
    nameservers = ["1.1.1.1" "9.9.9.9"];
    networkmanager = {
      enable = true;
      ensureProfiles.profiles = {
        "Wired connection 1" = {
          connection = {
            id = "Wired connection 1";
            type = "ethernet";
            interface-name = "eno1";
          };
          ipv4 = {
            method = "auto";
            ignore-auto-dns = true;
          };
          ipv6 = {
            method = "auto";
            ignore-auto-dns = true;
          };
        };
      };
    };
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
  };
}
