{...}: {
  imports = [
    ./boot.nix
    ./journald.nix
    ./locale.nix
    ./networking.nix
    ./nix.nix
    ./secrets.nix
    ./ssh.nix
    ./storage.nix
    ./users.nix
  ];
}
