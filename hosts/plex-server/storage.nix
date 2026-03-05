{
  config,
  pkgs,
  ...
}: let
  smartdWebhook = pkgs.writeShellScript "smartd-webhook" ''
        ALERT_TEXT="🚨 SMART Disk Warning 🚨
    Device: $SMARTD_DEVICE
    Event: $SMARTD_FAILTYPE
    Details: $SMARTD_MESSAGE"

        PAYLOAD=$(${pkgs.jq}/bin/jq -n \
          --arg msg "$ALERT_TEXT" \
          '{ "text": $msg }')

        ${pkgs.curl}/bin/curl -s -X POST \
          -H "Content-Type: application/json" \
          -d "$PAYLOAD" \
          "https://localhost:${toString config.server.ports.autoscan}/send-message" > /dev/null
  '';
  mediaDir = config.server.paths.mediaDir;
  libraryOwner = config.server.libraryOwner;
in {
  fileSystems.${config.server.paths.mediaDir} = {
    device = "/dev/disk/by-uuid/8059153a-838e-4bfd-82aa-5831c1f5047a";
    fsType = "ext4";
  };
  fileSystems."/mnt/backup" = {
    device = "/dev/disk/by-uuid/20af820e-357e-49fe-a62c-38b6039bffc5";
    fsType = "ext4";
  };

  systemd.tmpfiles.rules = [
    "d '${mediaDir}/media'         0775 ${libraryOwner.user} ${libraryOwner.group} - -"
    "d '${mediaDir}/media/movies'  0775 ${libraryOwner.user} ${libraryOwner.group} - -"
    "d '${mediaDir}/media/tv'      0775 ${libraryOwner.user} ${libraryOwner.group} - -"
    "d '${mediaDir}/torrents'       0775 ${libraryOwner.user} ${libraryOwner.group} - -"
    "d '${mediaDir}/transcode'     0775 ${libraryOwner.user} ${libraryOwner.group} - -"
  ];

  # Spin down the backup disk after 15 minutes of inactivity
  systemd.services.backup-disk-spindown = {
    description = "Set spindown timeout for backup disk";
    wantedBy = ["multi-user.target"];
    after = ["local-fs.target"];
    serviceConfig = {
      Type = "oneshot";
      RemainAfterExit = true;
      ExecStart = "${pkgs.hdparm}/bin/hdparm -S 180 /dev/disk/by-uuid/20af820e-357e-49fe-a62c-38b6039bffc5";
    };
  };

  services.smartd = {
    enable = true;
    autodetect = true;

    # Set default monitoring options.
    # -a: monitor all SMART properties
    # -o on: enable automatic offline testing
    # -s (...): schedule a Short test daily at 2 AM, and a Long test on Saturdays at 3 AM
    defaults.monitored = "-a -o on -s (S/../.././02|L/../../6/03) -m <nomailer> -M exec ${smartdWebhook}";
    notifications.mail.enable = false;
  };
}
