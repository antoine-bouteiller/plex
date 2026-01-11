{...}: {
  users.users.antoineb = {
    isNormalUser = true;
    description = "Antoine Bouteiller";
    extraGroups = ["networkmanager" "wheel" "podman" "media"];
    openssh.authorizedKeys.keys = [
      "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAICUZ+rb5WpsUv/4wVWlQ0aCRiNzZCIQngxXiNAJx6hJs antob@DESKTOP-ANTOINE"
      "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIHhSmVRhMXbxDkDOaUk0udibjBos2nDg6byvZ//dzMwL antob@DESKTOP-3R8RBJU"
      "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIIfK4sKI0QpEbaADjQm/7bK3DlNY/akOh+6yC+q3aG17 antoine.bouteiller@pelico.io"
    ];
  };

  users.groups.media = {};
}
