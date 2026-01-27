{...}: {
  imports = [
    ./boot.nix
    ./journald.nix
    ./locale.nix
    ./networking.nix
    ./nix.nix
    ./podman.nix
    ./secrets.nix
    ./ssh.nix
    ./storage.nix
    ./users.nix
    ./update.nix
  ];
}
