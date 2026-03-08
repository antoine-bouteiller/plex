_: {
  boot.loader.systemd-boot.enable = true;
  boot.loader.efi.canTouchEfiVariables = true;

  boot.kernelModules = ["coretemp" "nct6775"];
  boot.kernelParams = ["reboot=pci"];

  security.polkit.enable = true;

  environment = {
    etc = {
      "sysconfig/lm_sensors".text = ''
        HWMON_MODULES="coretemp nct6775"
      '';
    };
  };
}
