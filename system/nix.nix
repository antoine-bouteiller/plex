{pkgs, ...}: {
  nixpkgs.config.allowUnfree = true;
  nix.settings.experimental-features = ["nix-command" "flakes"];

  nix.gc = {
    automatic = true;
    dates = "weekly";
    options = "--delete-older-than 7d";
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

  nix.settings.cores = 2;

  zramSwap = {
    enable = true;
    memoryPercent = 50;
  };

  system.stateVersion = "25.11";
}
