{lib, ...}: {
  options.server = {
    paths = {
      app = lib.mkOption {
        type = lib.types.str;
        default = "/var/lib";
        description = "Application data directory (for databases, state files, etc.)";
      };

      data = lib.mkOption {
        type = lib.types.str;
        default = "/mnt/data";
        description = "Media data mount path";
      };
    };

    domain = lib.mkOption {
      type = lib.types.str;
      default = "antoinebouteiller.fr";
      description = "Primary domain name for services";
    };
  };
}
