Create Nginx reverse proxy configuration.

Create `config/nginx.conf` with a template for the EACEA Evaluator:

```nginx
server {
    listen 80;
    server_name evaluator.tudominio.com;  # Replace with actual domain

    # Redirect HTTP to HTTPS (uncomment after SSL setup)
    # return 301 https://$server_name$request_uri;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Increase timeout for PDF generation
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Static file caching
    location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        proxy_pass http://127.0.0.1:3000;
        expires 7d;
        add_header Cache-Control "public, immutable";
    }
}
```

Also create `config/nginx-ssl.conf` with the HTTPS version (for after Certbot):
```nginx
server {
    listen 443 ssl http2;
    server_name evaluator.tudominio.com;

    ssl_certificate /etc/letsencrypt/live/evaluator.tudominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/evaluator.tudominio.com/privkey.pem;

    # ... same location blocks as above ...
}

server {
    listen 80;
    server_name evaluator.tudominio.com;
    return 301 https://$server_name$request_uri;
}
```

Create `config/README.md` with instructions:
- How to copy the nginx config to /etc/nginx/sites-available/
- How to create symlink in sites-enabled
- How to test and reload nginx
- How to run certbot for SSL

Commit: "035: Add Nginx reverse proxy configuration"
