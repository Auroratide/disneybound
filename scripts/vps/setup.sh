#!/bin/bash
set -euo pipefail

# One-time setup for a fresh IONOS VPS.
# Run as root or with sudo.

# --- System packages ---
apt-get update && apt-get upgrade -y
apt-get install -y curl git ufw

# --- Node.js (via nvm) ---
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
export NVM_DIR="$HOME/.nvm"
source "$NVM_DIR/nvm.sh"
nvm install --lts
nvm use --lts

# --- pnpm ---
npm install -g pnpm

# --- PM2 ---
npm install -g pm2

# --- Docker ---
curl -fsSL https://get.docker.com | sh
systemctl enable docker
systemctl start docker

# --- Docker Compose plugin ---
apt-get install -y docker-compose-plugin

# --- Caddy ---
apt-get install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list
apt-get update
apt-get install -y caddy

# --- Firewall ---
ufw allow ssh
ufw allow http
ufw allow https
ufw --force enable

# --- App directory ---
mkdir -p /srv/disneybounding
echo ""
echo "Setup complete. Next steps:"
echo "  1. Add a deploy SSH key and clone the repo into /srv/disneybounding"
echo "  2. Copy .env.local and pocketbase/.env.local onto the server"
echo "  3. Run scripts/vps/start.sh to do the first deploy"
echo "  4. Configure /etc/caddy/Caddyfile and reload: systemctl reload caddy"
echo "  5. Point your DNS A record to this server's IP"
