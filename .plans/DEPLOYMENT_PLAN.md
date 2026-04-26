# Deployment Plan

Target: IONOS VPS running Next.js (host) + PocketBase (Docker).

---

## 1. Box Size

**2 vCPU / 2 GB RAM minimum.** Next.js builds are memory-hungry — 1 GB will struggle or fail. 20 GB SSD is plenty for PocketBase + images + code. Resize up later if needed.

---

## 2. Build + GitHub Actions Deployment

Run PocketBase in Docker (existing `docker-compose.yml`), run Next.js directly on the host with PM2.

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy via SSH
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          script: |
            cd /srv/disneybounding
            git pull origin main
            pnpm install --frozen-lockfile
            pnpm build
            pm2 restart nextjs
            docker compose pull
            docker compose up -d
```

Store `VPS_HOST`, `VPS_USER`, and `VPS_SSH_KEY` (the private key) as GitHub Actions secrets. On the server, add a deploy key with read access to the repo.

---

## 3. Domain Name Setup

1. Buy domain, point an **A record** to the VPS IP.
2. Install **Caddy** on the server — handles HTTPS automatically via Let's Encrypt.

```
# /etc/caddy/Caddyfile
disneybounding.com {
    reverse_proxy localhost:3000
}
```

For PocketBase admin UI (optional — only if you want it publicly accessible):
```
pb.disneybounding.com {
    reverse_proxy localhost:8090
}
```

Otherwise keep port 8090 firewalled and access it via SSH tunnel when needed:
```bash
ssh -L 8090:localhost:8090 user@yourserver
# Then visit http://localhost:8090/_/ locally
```

---

## 4. Migrations + PocketBase Login

**Migrations run automatically** when PocketBase starts — it picks up new JS files in `pb_migrations/`, which `docker-compose.yml` already mounts. Deploy flow: push migration files → Action deploys → Docker restarts PocketBase → migrations run.

**Create superuser on first boot:**
```bash
docker compose exec pocketbase ./pocketbase superuser create admin@youremail.com yourpassword
```

Set `PB_SUPERUSER_EMAIL` and `PB_SUPERUSER_PASSWORD` in the server environment so Next.js API routes can authenticate via `getAdminPocketbase()`.

---

## 5. Other Important Things

### Environment Variables

Create `.env.local` on the server (never commit it). Minimum required:
- `PB_URL=http://localhost:8090`
- `PB_SUPERUSER_EMAIL`
- `PB_SUPERUSER_PASSWORD`

### Auto-restart on Reboot

PocketBase data lives in the `pocketbase_data` Docker volume and survives reboots. The disk failing is the only data-loss risk — mitigated by offsite backups.

Enable Docker to start on boot (so the PocketBase container's `restart: unless-stopped` policy takes effect):
```bash
sudo systemctl enable docker
```

PM2's `pm2 startup` + `pm2 save` install a systemd service that restarts Next.js automatically.

Caddy installs itself as a systemd service by default — no extra steps needed.

Boot sequence: systemd → Docker (PocketBase) + PM2 (Next.js) + Caddy. Everything comes back without intervention.

### Firewall

Only expose ports 22, 80, 443. Keep 8090 and 3000 closed to the outside:
```bash
ufw allow ssh
ufw allow http
ufw allow https
ufw enable
```

### PM2 (Next.js process management)

```bash
pm2 start "pnpm start" --name nextjs
pm2 startup   # generates a systemd unit so it restarts on reboot
pm2 save
```

### Backups

PocketBase stores everything (DB + uploaded files) in the Docker volume `pocketbase_data`. Schedule a cron job to back it up off-server (S3, Backblaze B2, etc.):
```bash
docker run --rm -v pocketbase_data:/data -v /backups:/backup \
  alpine tar czf /backup/pb-$(date +%Y%m%d).tar.gz /data
```

---

## One-Time Server Setup Checklist

- [ ] Install Node.js (via `nvm`), `pnpm`, `pm2`, Docker, Docker Compose, Caddy
- [ ] Clone repo to `/srv/disneybounding`
- [ ] Add deploy SSH key (read-only access to repo)
- [ ] Write `.env.local` files for Next.js and `pocketbase/.env.local`
- [ ] Configure firewall (`ufw`)
- [ ] `sudo systemctl enable docker` — auto-start Docker on boot
- [ ] `docker compose up -d` — starts PocketBase, runs migrations
- [ ] Create PocketBase superuser
- [ ] `pnpm install && pnpm build && pm2 start "pnpm start" --name nextjs`
- [ ] Configure `/etc/caddy/Caddyfile` and reload Caddy
- [ ] Point DNS A record to VPS IP and wait for propagation
- [ ] Add GitHub Actions secrets (`VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`)
- [ ] Push to `main` and verify the Action deploys cleanly
