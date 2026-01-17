{
  config,
  pkgs,
  ...
}: let
  user = "plextraktsync";
  group = "plextraktsync";
  dataDir = "${config.server.paths.app}/plextraktsync";
in {
  users.users.${user} = {
    isSystemUser = true;
    group = group;
  };
  users.groups.${group} = {};

  virtualisation.oci-containers = {
    backend = "podman";
    containers.plextraktsync = {
      image = "ghcr.io/taxel/plextraktsync:latest";
      user = "${toString config.users.users.${user}.uid}:${toString config.users.groups.${group}.gid}";
      volumes = [
        "${dataDir}:/app/config"
      ];
      cmd = ["sync"];

      autoStart = false;
    };
  };

  systemd.services.plextraktsync-daily = {
    description = "Pull latest image and run PlexTraktSync";
    after = ["network-online.target"];
    wants = ["network-online.target"];

    serviceConfig = {
      Type = "oneshot";
      ExecStart = pkgs.writeShellScript "plextraktsync-run" ''
        ${pkgs.podman}/bin/podman pull ghcr.io/taxel/plextraktsync:latest
        ${pkgs.systemd}/bin/systemctl start podman-plextraktsync.service
      '';
    };
  };

  systemd.timers.plextraktsync-daily = {
    description = "Daily PlexTraktSync Task";
    timerConfig = {
      OnCalendar = "daily";
      Persistent = true;
    };
    wantedBy = ["timers.target"];
  };
}
