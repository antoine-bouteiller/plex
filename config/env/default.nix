{lib, ...}: {
  options.env = {
    appPath = lib.mkOption {
      type = lib.types.str;
      default = "/var/lib";
      description = "Application data directory (for databases, state files, etc.)";
    };

    dataPath = lib.mkOption {
      type = lib.types.str;
      default = "/mnt/data";
      description = "Media data mount path";
    };

    domain = lib.mkOption {
      type = lib.types.str;
      default = "antoinebouteiller.fr";
      description = "Primary domain name for services";
    };
  };

  config.sops = {
    defaultSopsFile = ./secrets.yaml;
    defaultSopsFormat = "yaml";
    age.sshKeyPaths = ["/etc/ssh/ssh_host_ed25519_key"];
  };
}
