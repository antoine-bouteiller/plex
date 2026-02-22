{pkgs, ...}: let
  flakePath = "/etc/nixos";
in {
  systemd.services = {
    flake-update = {
      stopIfChanged = false;
      restartIfChanged = false;

      unitConfig = {
        Description = "Update flake inputs";
        StartLimitIntervalSec = 300;
        StartLimitBurst = 5;
      };

      serviceConfig = {
        WorkingDirectory = flakePath;

        ExecStart = pkgs.writeShellScript "flake-update-script" ''
          ${pkgs.nix}/bin/nix flake update

          if ! ${pkgs.git}/bin/git diff --exit-code flake.lock > /dev/null; then
              ${pkgs.git}/bin/git add flake.lock
              ${pkgs.git}/bin/git commit -m "chore(deps): auto-update flake.lock"
          fi
        '';
        Restart = "on-failure";
        RestartSec = "30";
        Type = "oneshot";

        Environment = [
          "GIT_AUTHOR_NAME='Antoine Bouteiller'"
          "GIT_AUTHOR_EMAIL=115460763+antoine-bouteiller@users.noreply.github.com"
          "GIT_COMMITTER_NAME='Antoine Bouteiller'"
          "GIT_COMMITTER_EMAIL=115460763+antoine-bouteiller@users.noreply.github.com"
        ];
      };

      before = ["nixos-upgrade.service"];
      path = [pkgs.nix pkgs.git pkgs.host];
    };
  };

  system.autoUpgrade = {
    enable = true;
    dates = "Mon *-*-* 01:00:00";

    flake = flakePath;
    flags = [
      "-L"
    ];

    allowReboot = false;
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
