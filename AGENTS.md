# Plex Server NixOS Configuration

NixOS flake configuration for a home media server running Plex and the *arr stack.

## Commands

```bash
nixos-rebuild switch --flake .#plex-server  # Build and switch
nix flake update                             # Update flake inputs
```

## Configuration

- **Domain:** `antoinebouteiller.fr`
- **Media group:** `media`
- **Data paths:** `/mnt/data`, `/mnt/movies`
