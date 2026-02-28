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
in {
  fileSystems."/mnt/data" = {
    device = "/dev/disk/by-uuid/20af820e-357e-49fe-a62c-38b6039bffc5";
    fsType = "ext4";
  };

  systemd.tmpfiles.rules = [
    "d /mnt/data 2775 root media - -"
    "Z /mnt/data 2775 root media - -"
  ];

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
