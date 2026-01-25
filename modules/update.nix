{
  pkgs,
  ...
}:{
  systemd.services = {
    flake-update = {
      unitConfig = {
        Description = "Update flake inputs";
        StartLimitIntervalSec = 300;
        StartLimitBurst = 5;
      };
      serviceConfig = {
        ExecStart = "${pkgs.nix}/bin/nix flake update --commit-lock-file ${flakePath}";
        Restart = "on-failure";
        RestartSec = "30";
        Type = "oneshot";
      };
      before = ["nixos-upgrade.service"];
      path = [pkgs.nix pkgs.git pkgs.host];
    };
  };

  system.autoUpgrade = {
    enable = true;
    dates = "01:00";

    flake = "/etc/nixos";
    flags = [
       "-L"
     ];

    allowReboot = true;
    rebootWindow = {
      lower = "01:00";
      upper = "03:00";
    };
  };

  systemd.services.nixos-upgrade = {
    serviceConfig = {
      Restart = "on-failure";
      RestartSec = "120";
    };
    unitConfig = {
      StartLimitIntervalSec = 600;
      StartLimitBurst = 2;
    };
    after = ["flake-update.service"];
    wants = ["flake-update.service"];
    path = [pkgs.host];
  };
}
