{...}: {
  time.timeZone = "Europe/Paris";

  i18n.defaultLocale = "en_GB.UTF-8";

  services.xserver.xkb = {
    layout = "fr";
    variant = "";
  };

  console.keyMap = "fr";
}
