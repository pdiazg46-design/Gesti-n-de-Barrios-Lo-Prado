---
description: Protocolo de desarrollo sin intervención manual (Zero Touch), incluyendo el versionamiento y despliegue automático del código.
---

# Habilidad: Zero Touch (Automatización de Despliegue)

Cuando el usuario invoque el protocolo **Zero Touch** o pida que un desarrollo se complete de principio a fin sin su intervención, aplicarás estrictamente las siguientes reglas:

1. **Ejecución Completa y Autónoma:**
   - Realiza los diagnósticos, escribe el código, aplica los parches y verifica la estabilidad en el entorno local de forma proactiva.
   - Aplica en conjunto la visión global (`/vision_global`) para asegurar que nada preexistente se rompa.

2. **Commit y Push Obligatorio (Regla de Oro):**
   - **NUNCA OLVIDAR:** Cada vez que finalices una mejora, corrección o epic bajo este protocolo, DEBES ejecutar los comandos de Git necesarios para subir el código a la plataforma (`git add .`, `git commit -m "feat/fix: [descripción]"`, y `git push`).
   - El trabajo no se considera terminado hasta que el código esté a salvo en el repositorio remoto, listo para que plataformas como Vercel o GitHub Actions inicien el despliegue automático.

3. **Autogestión de Terminal:**
   - Eres responsable de usar la terminal para este proceso. Si hay conflictos de merge ligeros, resuélvelos. Si el push se completó con éxito, notifícalo.
