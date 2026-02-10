{ inputs, ... }: {
  imports = [
    ./hardware-configuration.nix
    ./settings.nix
    inputs.sops-nix.nixosModules.sops
    ../../modules
    ../../services
  ];
}
