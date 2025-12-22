#!/bin/bash

set -e

TARGET_USER="${SUDO_USER:-$USER}"

TARGET_HOME=$(eval echo "~$TARGET_USER")
SSH_DIR="$TARGET_HOME/.ssh"
AUTHORIZED_KEYS="$SSH_DIR/authorized_keys"

mkdir -p "$SSH_DIR"
chmod 700 "$SSH_DIR"
chown "$TARGET_USER:$TARGET_USER" "$SSH_DIR"

[[ -f "$AUTHORIZED_KEYS" ]] && cp "$AUTHORIZED_KEYS" "${AUTHORIZED_KEYS}.backup.$(date +%Y%m%d_%H%M%S)"

> "$AUTHORIZED_KEYS"

while IFS= read -r key; do
    [[ -n "$key" ]] && echo "$key" >> "$AUTHORIZED_KEYS"
done

chown "$TARGET_USER:$TARGET_USER" "$AUTHORIZED_KEYS"
chmod 600 "$AUTHORIZED_KEYS"

echo "✓ SSH keys configured for $TARGET_USER"
