---
name: Flujo de Ideación Ágil (Tablero de Proyectos)
description: Habilidad para atrapar ráfagas de ideas del usuario sin interrumpir su creatividad, documentándolas en un tablero central antes de ejecutarlas, evitando inundar su panel de trabajo con archivos.
---
# Flujo de Ideación Ágil (Captura y Ejecución)

## Propósito
Diseñado para un usuario de mente rápida (o modo ráfaga) que necesita lanzar instrucciones e ideas sin que la IA interrumpa el flujo creativo ejecutándolas inmediatamente o llenando el panel central (UI del IDE) con múltiples pestañas y código innecesario. Esta configuración asegura que tu atención como asistente permanezca en recolectar la información primero y, de manera disciplinada y atómica, ejecutarla después bajo la aprobación del usuario.

## Reglas Obligatorias de Interfaz y Comportamiento

1. **Gestión Estricta de Pestañas (Panel Central):**
   - No abras archivos de código en el panel visual principal a menos que vayas a trabajar en ellos inmediatamente y haya sido acordado con el usuario.
   - El trabajo asume que el usuario tiene un diseño visual de tres columnas (Archivos, Pestañas de Editor, Chat). Respeta su centro de trabajo.

2. **La Biblia Siempre Presente:**
   - La documentación fundacional de negocio, arquitectura o reglas (Ej. 'Biblia de Emprende' o lineamientos troncales) debe considerarse "Abierta y Activa" en tu memoria contextual (Knowledge Items o lectura imperceptible) durante toda la sesión. Empléala antes de formular soluciones.

3. **El Tablero de Ideas Obligatorio:**
   - Apenas inicie la fase de ideación o cuando detectes múltiples requerimientos veloces, crea o abre un archivo llamado `tablero_de_ideas.md` o análogo en el sistema y ubícalo estratégicamente como único punto de atención principal en el centro.

## La Estructura del Tablero
Debes mantener documentada cada tarea lanzada con el escuadro exacto a continuación:

- **Requerimiento:** [Resumen muy conciso de la tarea]
- **Estado:** ⏳ Pendiente / 🚧 En Trabajo / ✅ Ejecutado (Por ti, el IA)
- **Visto Bueno (OK):** ⬜ (Solo el Usuario lo llena o te ordena que lo llenes para dar su pase oficial a Producción).

## Ciclo de Ejecución Sincronizado
- **Fase Ráfaga:** Solo dedícate a asentar las ideas rápidamente en el tablero y acusar recibo por chat.
- **Fase Ejecución:** Cuando el usuario diga "vamos" o escoja una tarea, resuélvela. Pasa el *Estado* a ✅ Ejecutado. 
- **Fuga Contenida:** Espera siempre el OK ⬜ final de la verificación del usuario en su ambiente local antes de arrancar a programar el siguiente punto masivo.
