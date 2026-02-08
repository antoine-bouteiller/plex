# Plex Server

NixOS flake configuration for a home media server.

## Services

| Service | Description | Port |
|---------|-------------|------|
| Plex | Media server | 32400 |
| Sonarr | TV show management | 8989 |
| Radarr | Movie management | 7878 |
| Prowlarr | Indexer manager | 9696 |
| Bazarr | Subtitle management | 6767 |
| Jellyseerr | Media requests | 5055 |
| qBittorrent | Torrent client | 8080 |
| Caddy | Reverse proxy | 80/443 |
| Authelia | Authentication | 9091 |
| Homepage | Dashboard | 8082 |

## Usage

```bash
# Build and apply configuration
nixos-rebuild switch --flake .#plex-server

# Update dependencies
nix flake update
```

## Structure

```
.
├── flake.nix                 # Flake entry point
├── configuration.nix         # Main NixOS config
├── settings.nix              # Shared settings
├── modules/                  # System modules
│   ├── boot.nix
│   ├── networking.nix
│   ├── storage.nix
│   ├── ssh.nix
│   └── ...
├── services/                 # Media services
│   ├── plex.nix
│   ├── sonarr.nix
│   ├── radarr.nix
│   └── ...
└── secrets/                  # SOPS-encrypted secrets
```

## Requirements

- NixOS with flakes enabled
- SOPS for secrets management
