{config, ...}: {
  networking = {
    hostName = "plex-server";
    nameservers = ["1.1.1.1" "9.9.9.9"];
    hosts = {
      "192.168.1.254" = ["mabbox.bytel.fr"];
    };
  };

  boot.kernel.sysctl = {
    "net.ipv6.conf.all.disable_ipv6" = 1;
    "net.ipv6.conf.default.disable_ipv6" = 1;
  };

  networking.firewall = {
    enable = true;
    allowedTCPPorts = [
      22 # SSH
      80 # HTTP (Caddy)
      443 # HTTPS (Caddy)
      config.server.ports.plex
      51413 # Transmission peer port
    ];
  };
}
