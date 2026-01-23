{pkgs, ...}: {
  nixpkgs.config.allowUnfree = true;
  nix.settings.experimental-features = ["nix-command" "flakes"];

  nix.gc = {
    automatic = true;
    dates = "weekly";
    options = "--delete-older-than 7d";
  };

  system.autoUpgrade = {
    enable = true;
    dates = "01:00";
    allowReboot = true;
    rebootWindow = {
      lower = "03:00";
      upper = "05:00";
    };
  };

  programs.zsh.enable = true;
  environment.systemPackages = with pkgs; [
    git
    curl
    lm_sensors
    bat
    zoxide
    starship
    ffmpeg
  ];

  system.stateVersion = "25.11";
}
