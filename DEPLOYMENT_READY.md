# EACEA Evaluator — Listo para despliegue

Fecha: 2026-04-01

## Criterios de aceptación verificados

| # | Criterio | Estado |
|---|----------|--------|
| 1 | El app carga el proyecto activo desde SQLite | ✅ PASS |
| 2 | Se pueden editar los campos del intake | ✅ PASS |
| 3 | Se pueden editar preguntas (código, título, prompt, puntuación) | ✅ PASS |
| 4 | Se pueden editar criterios (miniPoints) | ✅ PASS |
| 5 | Se pueden editar puntuaciones manuales | ✅ PASS |
| 6 | El autosave funciona (endpoint /autosave) | ✅ PASS |
| 7 | Se pueden crear y listar versiones manuales | ✅ PASS |
| 8 | Las versiones guardadas se pueden restaurar | ✅ PASS |
| 9 | Export JSON funciona con Content-Disposition | ✅ PASS |
| 10 | Export HTML printable funciona | ✅ PASS |
| 11 | Todo el JS tiene sintaxis válida | ✅ PASS |
| 12 | El servidor Express arranca sin errores | ✅ PASS |
| 13 | El esquema de la BD tiene las 3 tablas correctas | ✅ PASS |

## Para desplegar en producción

```bash
# 1. Arrancar con PM2
pm2 start ecosystem.config.js
pm2 save

# 2. Configurar Nginx (puerto 3005)
sudo cp config/nginx.conf /etc/nginx/conf.d/eacea-evaluator.conf
# Editar server_name con el dominio real
sudo nginx -t && sudo systemctl reload nginx

# 3. SSL con Certbot
sudo certbot --nginx -d evaluador.eufundingschool.com
```

## Stack
- Node.js + Express (puerto 3005 en producción)
- SQLite con better-sqlite3
- Vanilla JS frontend (sin frameworks)
- PM2 para gestión de procesos
- Nginx como reverse proxy
