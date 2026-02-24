{ inputs, ... }: {
  imports = [
    ./hardware-configuration.nix
    ./settings.nix
    inputs.sops-nix.nixosModules.sops
    inputs.autoscan.nixosModules.default
    ../../modules
    ../../services
  ];
}
