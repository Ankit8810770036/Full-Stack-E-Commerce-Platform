# Custom Domain Configuration & Deployment Guide: Cartify

This document details the production DNS configuration, reverse proxy setup, and SSL/TLS certificate deployment for the custom domain: **cartify.in**.

---

## 1. Production Domains

- **Storefront Web App**: `https://cartify.in` (and `https://www.cartify.in`)
- **Backend Microservices API Gateway**: `https://api.cartify.in`

---

## 2. DNS Zone Records Configuration

In your DNS provider dashboard (Cloudflare, AWS Route 53, GoDaddy, or Namecheap), configure the following records:

| Record Type | Host / Name | Target / Value | TTL | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **A** | `@` | `76.76.21.21` (or your edge/server IP) | Auto / 300 | Apex domain pointing to edge CDN |
| **CNAME** | `www` | `cartify.in` | Auto / 300 | Redirect www to apex domain |
| **A** or **CNAME** | `api` | `<your-gateway-server-ip>` or load balancer host | 300 | Routes to Spring Cloud Gateway on port 8085 |
| **TXT** | `@` | `v=spf1 include:... ~all` | 3600 | Domain verification & email deliverability |

---

## 3. Web Server & Reverse Proxy Configuration (Nginx)

When deploying to a dedicated server or cloud VM (AWS EC2 / DigitalOcean), deploy the following Nginx configuration:

```nginx
# 1. Frontend Web App: cartify.in
server {
    listen 80;
    listen [::]:80;
    server_name cartify.in www.cartify.in;
    return 301 https://cartify.in$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name cartify.in www.cartify.in;

    ssl_certificate /etc/letsencrypt/live/cartify.in/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/cartify.in/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    root /var/www/cartify/dist;
    index index.html;

    # Single Page App routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Static assets cache control
    location ~* \.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
}

# 2. Microservices API Gateway: api.cartify.in
server {
    listen 80;
    server_name api.cartify.in;
    return 301 https://api.cartify.in$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.cartify.in;

    ssl_certificate /etc/letsencrypt/live/cartify.in/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/cartify.in/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:8085;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 4. Automatic SSL Provisioning (Let's Encrypt / Certbot)

Run Certbot to generate and maintain trusted TLS certificates:

```bash
sudo certbot --nginx -d cartify.in -d www.cartify.in -d api.cartify.in
```

---

## 5. Frontend Environment Configuration

In production, Vite builds using the production environment file:

- **Config file**: `frontend/.env.production`
- **Variable**: `VITE_API_URL=https://api.cartify.in`

Build command:
```bash
npm run build
```
This produces optimized production assets with the custom domain preconfigured in `frontend/public/CNAME`.
