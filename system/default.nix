{...}: {
  imports = [
    ./boot.nix
    ./journald.nix
    ./locale.nix
    ./nix.nix
    ./secrets.nix
    ./ssh.nix
    ./users.nix
    ./update.nix
  ];
}
