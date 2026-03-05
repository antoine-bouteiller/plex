{inputs, ...}: {
  imports = [
    ./settings.nix
    ./system
    ./hardware
    ./services
    inputs.sops-nix.nixosModules.sops
    inputs.autoscan.nixosModules.default
  ];
}
