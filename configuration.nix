{...}: {
  imports = [
    ./hardware-configuration.nix
    ./settings.nix
    ./modules
    ./services
  ];
}
