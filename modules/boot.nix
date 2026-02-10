{...}: {
  boot.loader.systemd-boot.enable = true;
  boot.loader.efi.canTouchEfiVariables = true;
  boot.kernelModules = ["coretemp" "nct6775"];
  boot.kernelParams = ["reboot=pci"];

  environment = {
    etc = {
      "sysconfig/lm_sensors".text = ''
        HWMON_MODULES="coretemp nct6775"
      '';
    };
  };

  security.polkit.enable = true;
}
