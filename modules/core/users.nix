{...}: {
  users.users.antoineb = {
    isNormalUser = true;
    description = "Antoine Bouteiller";
    extraGroups = ["networkmanager" "wheel" "docker" "media"];
    openssh.authorizedKeys.keys = [
      "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAICUZ+rb5WpsUv/4wVWlQ0aCRiNzZCIQngxXiNAJx6hJs antob@DESKTOP-ANTOINE"
      "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIHhSmVRhMXbxDkDOaUk0udibjBos2nDg6byvZ//dzMwL antob@DESKTOP-3R8RBJU"
    ];
  };

  users.groups.media = {};
}
