{...}: {
  imports = [
    ./boot.nix
    ./networking.nix
    ./locale.nix
    ./users.nix
    ./ssh.nix
    ./nix.nix
    ./journald.nix
  ];
}
