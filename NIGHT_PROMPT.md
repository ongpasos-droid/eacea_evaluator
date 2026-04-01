# NIGHT_PROMPT - Instrucciones para Claude VPS

## Proyecto: EACEA Evaluator
## Fecha: 2026-04-01

## Que hacer
Ejecutar las tareas de la carpeta cascades/ en orden numerico.
Empezar por 001_init_repo.md y avanzar en secuencia.

## Contexto
- Leer CLAUDE.md antes de empezar: contiene la arquitectura completa, stack tecnico, y reglas.
- Leer GUIA_SETUP.md para la configuracion del entorno.
- Cada archivo en cascades/ es una tarea autocontenida con instrucciones claras.

## Reglas
- Ejecutar las tareas en orden estricto (001, 002, 003...)
- Hacer commit despues de cada tarea completada con exito
- Si una tarea falla, registrar el error y pasar a la siguiente solo si no hay dependencia
- No modificar CLAUDE.md
- No hacer force push

## Definicion de terminado
- Las tareas ejecutadas funcionan sin errores
- Cada tarea tiene su commit
- Se genera NIGHT_REPORT.md al terminar con el resumen de lo hecho
