{
  lib,
  config,
  ...
}: let
  cfg = config.env;
in {
  options.env = {
    user = lib.mkOption {
      type = lib.types.str;
      default = "antoineb";
      description = "User name";
    };

    nixDir = lib.mkOption {
      type = lib.types.str;
      default = "/home/${cfg.user}/plex";
      description = "User home directory";
    };

    appPath = lib.mkOption {
      type = lib.types.str;
      default = "/var/lib";
      description = "Applications directory path";
    };

    dataPath = lib.mkOption {
      type = lib.types.str;
      default = "/mnt/data";
      description = "Data mount path";
    };

    moviesPath = lib.mkOption {
      type = lib.types.str;
      default = "/mnt/movies";
      description = "Movies mount path";
    };

    domain = lib.mkOption {
      type = lib.types.str;
      default = "antoinebouteiller.fr";
      description = "Domain name";
    };

    configsPath = lib.mkOption {
      type = lib.types.str;
      default = "${cfg.nixDir}/configs";
      description = "Configurations directory path";
    };
  };
}
