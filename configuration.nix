{pkgs, ...}: {
  imports = [
    ./hardware-configuration.nix
    ./services
    ./config
  ];

  boot.loader.systemd-boot.enable = true;
  boot.loader.efi.canTouchEfiVariables = true;

  # Disk mounting configuration
  # Replace UUIDs with your actual disk UUIDs (find with: blkid)

  networking = {
    hostName = "plex-server";
    nameservers = ["1.1.1.1" "9.9.9.9"];
    networkmanager.enable = true;
  };

  # Set your time zone.
  time.timeZone = "Europe/Paris";

  # Select internationalisation properties.
  i18n.defaultLocale = "en_GB.UTF-8";

  # Configure keymap in X11
  services.xserver.xkb = {
    layout = "fr";
    variant = "";
  };

  # Configure console keymap
  console.keyMap = "fr";

  # User configuration
  users.users.antoineb = {
    isNormalUser = true;
    description = "Antoine Bouteiller";
    extraGroups = ["networkmanager" "wheel" "docker" "media"];
    openssh.authorizedKeys.keys = [
      "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAICUZ+rb5WpsUv/4wVWlQ0aCRiNzZCIQngxXiNAJx6hJs antob@DESKTOP-ANTOINE"
      "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIHhSmVRhMXbxDkDOaUk0udibjBos2nDg6byvZ//dzMwL antob@DESKTOP-3R8RBJU"
    ];
  };

  # SSH configuration
  services.openssh = {
    enable = true;
    ports = [22];
    settings = {
      PasswordAuthentication = false;
      KbdInteractiveAuthentication = false;
      PermitRootLogin = "no";
    };
  };

  # Firewall configuration
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

  # Automatic system updates
  system.autoUpgrade = {
    enable = true;
    dates = "01:00";
    allowReboot = true;
    rebootWindow = {
      lower = "03:00";
      upper = "05:00";
    };
  };

  # Automatic garbage collection
  nix.gc = {
    automatic = true;
    dates = "weekly";
    options = "--delete-older-than 7d";
  };

  # Essential packages
  environment.systemPackages = with pkgs; [
    git
    curl
  ];

  nixpkgs.config.allowUnfree = true;
  nix.settings.experimental-features = ["nix-command" "flakes"];
  system.stateVersion = "25.11";
}
