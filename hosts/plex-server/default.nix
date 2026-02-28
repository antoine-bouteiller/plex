{ inputs, ... }: {
  imports = [
    ./hardware-configuration.nix
    ./settings.nix
    ./boot.nix
    ./networking.nix
    ./storage.nix
    inputs.sops-nix.nixosModules.sops
    inputs.autoscan.nixosModules.default
    ../../modules
    ../../services
  ];
}
