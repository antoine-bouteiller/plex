{config, ...}: {
  virtualisation.podman = {
    enable = true;
    dockerCompat = true;
  };

  sops.secrets."docker_token" = {};

  sops.templates."podman-auth.json" = {
    content = builtins.toJSON {
      auths = {
        "https://index.docker.io/v1/" = {
          auth = config.sops.placeholder."docker_token";
        };
      };
    };
  };

  environment.sessionVariables.REGISTRY_AUTH_FILE = config.sops.templates."podman-auth.json".path;
}
