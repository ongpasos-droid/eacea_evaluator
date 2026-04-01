# Guia de Setup - Sistema de Cascadas EACEA Evaluator

## Que es esto

Este sistema permite que Claude Code trabaje de forma autonoma durante la noche en tu VPS, ejecutando tareas secuenciales para construir la app EACEA Evaluator. Cada tarea ("cascada") dura menos de 3 minutos y el sistema:

- Ejecuta cascadas una por una en orden logico
- Hace testing cada N tareas para verificar que todo funciona
- Si se queda sin creditos, guarda el progreso y se reactiva automaticamente en 4 horas
- Si una tarea falla, reintenta hasta 2 veces antes de continuar con la siguiente
- Registra todo en un log detallado

## Estructura de archivos

```
eacea-cascade-system/
  CLAUDE.md           -> Contexto del proyecto (va al repo)
  run.sh              -> Orquestador principal
  GUIA_SETUP.md       -> Este archivo
  cascades/           -> 37 tareas en orden
    001_init_repo.md
    002_setup_express.md
    ...
    037_bugfix_sweep.md
```

## Fases del proyecto

| Fase | Cascadas | Que hace |
|------|----------|----------|
| 0: Setup | 001-005 | Repo, Express, SQLite, seed data |
| 1: API | 006-012 | Todos los endpoints REST |
| 2: Frontend base | 013-020 | HTML, CSS, state, api client, sidebar, intake |
| 3: UI completa | 021-025 | Question config, criteria, scoring, versions |
| 4: Persistencia | 026-030 | Autosave, colores, responsive, visibilidad |
| 5: Export/Deploy | 031-037 | JSON/PDF export, PM2, Nginx, tests finales |

Tests automaticos en: 005, 012, 020, 025, 030, 036

## Pasos de instalacion en el VPS

### 1. Conectate a tu VPS

```bash
ssh tu_usuario@91.98.28.251
```

### 2. Elige donde va el proyecto

```bash
# Crea el directorio del proyecto
mkdir -p ~/eacea_evaluator
cd ~/eacea_evaluator
```

La "ruta del proyecto" es simplemente donde viven los archivos de codigo en el disco de tu servidor. En tu caso sera `/home/tu_usuario/eacea_evaluator`. La IP (91.98.28.251) es como la gente accede desde el navegador - Nginx conecta las dos cosas.

### 3. Inicializa el repo de GitHub

```bash
git init
git remote add origin https://github.com/ongpasos-droid/eacea_evaluator.git
```

### 4. Copia los archivos del sistema de cascadas

Desde tu ordenador local, sube los archivos al VPS:

```bash
# Desde tu ordenador (donde tienes los archivos):
scp -r eacea-cascade-system/* tu_usuario@91.98.28.251:~/eacea_evaluator/
```

O si prefieres, clona todo manualmente:
- Sube `CLAUDE.md` a la raiz del proyecto
- Sube `run.sh` a la raiz
- Sube la carpeta `cascades/` completa
- Sube el HTML prototipo a `prototype/`

### 5. Copia el prototipo HTML

```bash
# Crea la carpeta prototype y copia el HTML ahi
mkdir -p ~/eacea_evaluator/prototype
# Sube el archivo eacr_response_framework_prototype_v_2.html a esa carpeta
```

### 6. Hazlo ejecutable

```bash
cd ~/eacea_evaluator
chmod +x run.sh
```

### 7. Verifica que Claude Code funciona

```bash
claude --version
# Deberia mostrar la version instalada

# Test rapido
claude -p "Responde solo 'OK' si puedes leer esto"
```

### 8. Verifica que Node y SQLite estan disponibles

```bash
node --version    # Deberia ser v18+ o v20+
npm --version     # Deberia ser v9+
```

Si no tienes SQLite3 (la libreria de sistema):
```bash
sudo apt-get update && sudo apt-get install -y build-essential python3
```
(better-sqlite3 necesita compilar un modulo nativo)

### 9. Instala `at` para el auto-resume (opcional pero recomendado)

```bash
sudo apt-get install -y at
sudo systemctl enable atd
sudo systemctl start atd
```

### 10. Lanza las cascadas

```bash
cd ~/eacea_evaluator

# Opcion A: En primer plano (puedes ver el progreso)
./run.sh

# Opcion B: En segundo plano con nohup (recomendado para la noche)
nohup ./run.sh > cascade_run.log 2>&1 &
echo $! > .run_pid
echo "Lanzado en background. PID: $(cat .run_pid)"
```

## Monitoreo durante la noche

### Ver el progreso en tiempo real

```bash
# Ver el log en tiempo real
tail -f cascade.log

# Ver el resumen de progreso
cat PROGRESS.md

# Ver el estado actual
./run.sh --status
```

### Si algo va mal

```bash
# Ver que cascada esta ejecutando
./run.sh --status

# Relanzar desde una cascada especifica
./run.sh --from 015

# Reintentar la ultima cascada fallida
./run.sh --retry
```

### A la manana siguiente

```bash
# 1. Mira el estado
./run.sh --status

# 2. Mira el log completo
cat cascade.log

# 3. Mira que se completo
cat PROGRESS.md

# 4. Si hubo una pausa por creditos, mira:
cat PAUSED.md  # (si existe)

# 5. Verifica que la app funciona
node server/index.js &
curl http://localhost:3000/
kill %1

# 6. Si todo va bien, commit final y push
git add -A
git commit -m "EACEA Evaluator v1 - built by Claude Code"
git push origin main
```

## Que hacer si se acaban los creditos

El sistema detecta automaticamente cuando Claude Code se queda sin creditos:

1. Guarda el estado exacto (que cascada estaba ejecutando)
2. Crea un archivo `PAUSED.md` con la informacion del punto de parada
3. Programa una reanudacion automatica en 4 horas (via `at` o proceso background)

**Si la reanudacion automatica no funciona:**
```bash
# Verifica donde se quedo
cat PAUSED.md

# Relanza manualmente
./run.sh --retry
```

**Si quieres cambiar el tiempo de espera** (por defecto 4 horas):
Edita `run.sh` y cambia `COOLDOWN_HOURS=4` por el valor que quieras.

## Despues de completar las cascadas

Cuando todas las cascadas se completen:

1. **Verifica la app localmente**:
   ```bash
   node server/index.js
   # Abre http://91.98.28.251:3000 en tu navegador
   ```

2. **Configura PM2** para produccion:
   ```bash
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup  # Sigue las instrucciones que te da
   ```

3. **Configura Nginx**:
   ```bash
   sudo cp config/nginx.conf /etc/nginx/sites-available/eacea-evaluator
   sudo ln -s /etc/nginx/sites-available/eacea-evaluator /etc/nginx/sites-enabled/
   # Edita el archivo y pon tu dominio real
   sudo nginx -t
   sudo systemctl reload nginx
   ```

4. **SSL con Certbot** (si tienes dominio):
   ```bash
   sudo certbot --nginx -d tu-dominio.com
   ```

5. **Push a GitHub**:
   ```bash
   git add -A
   git commit -m "EACEA Evaluator v1 complete"
   git push origin main
   ```

## Solucion de problemas comunes

### "better-sqlite3 no compila"
```bash
sudo apt-get install -y build-essential python3 g++
npm rebuild better-sqlite3
```

### "Claude Code no reconoce claude -p"
Verifica que Claude Code esta en el PATH:
```bash
which claude
# Si no aparece, usa la ruta completa en run.sh
```

### "El servidor no arranca"
```bash
# Mira los errores
node server/index.js
# Errores comunes: puerto ya en uso, modulos no instalados
lsof -i :3000  # Ver si el puerto esta ocupado
npm install     # Reinstalar dependencias
```

### "Quiero saltar una cascada"
```bash
# Edita .cascade_state manualmente:
echo "CURRENT_CASCADE=015_frontend_state
STATUS=completed
RETRIES=0
LAST_COMPLETED=015_frontend_state" > .cascade_state

# Luego lanza normalmente y continuara desde la 016
./run.sh
```
