{...}: {
  services.journald.extraConfig = ''
    MaxRetentionSec=1week
  '';
}
