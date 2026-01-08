{...}: {
  fileSystems."/mnt/data" = {
    device = "/dev/disk/by-uuid/20af820e-357e-49fe-a62c-38b6039bffc5";
    fsType = "ext4";
  };

  systemd.tmpfiles.rules = [
    "d /mnt/data 0775 root media - -"
    "Z /mnt/data 0775 root media - -"
  ];
}
