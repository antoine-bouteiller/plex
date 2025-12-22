#!/bin/bash

set -e

PROJECT_DIR="$1"
UPDATE_TIME="$2"

[[ $EUID -ne 0 ]] && { echo "Error: Must run as root"; exit 1; }
[[ -z "$PROJECT_DIR" ]] && { echo "Error: Project directory not provided"; exit 1; }
[[ -z "$UPDATE_TIME" ]] && { echo "Error: Update time not provided"; exit 1; }
[[ ! -d "$PROJECT_DIR" ]] && mkdir -p "$PROJECT_DIR"

cat > /etc/systemd/system/plex-update.service << EOF
[Unit]
Description=Update Plex Docker Compose stack
After=network.target docker.service
Requires=docker.service

[Service]
Type=oneshot
WorkingDirectory=$PROJECT_DIR
ExecStart=/bin/bash -c 'docker compose pull && docker compose up -d --remove-orphans'
User=$SUDO_USER
Group=$SUDO_USER
EOF

cat > /etc/systemd/system/plex-update.timer << EOF
[Unit]
Description=Daily update timer for Plex Docker Compose
Requires=plex-update.service

[Timer]
OnCalendar=*-*-* $UPDATE_TIME
Persistent=true

[Install]
WantedBy=timers.target
EOF

chmod 644 /etc/systemd/system/plex-update.{service,timer}
systemctl daemon-reload
systemctl enable --now plex-update.timer

echo "✓ Docker auto-update configured (daily at $UPDATE_TIME)"
