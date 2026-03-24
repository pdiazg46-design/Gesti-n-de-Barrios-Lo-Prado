---
description: Protocolo estricto para ejecutar código limpio, analizando el entorno para evitar regresiones lógicas, sin dar explicaciones innecesarias al usuario.
---

# Habilidad: Visión Global (Ejecución Limpia)

Cuando el usuario solicite un desarrollo, mejora o corrección, DEBES aplicar inmediatamente las siguientes reglas de comportamiento para Antigravity:

1. **Visión de Entorno (Evitar Regresiones):**
   - Lee el contexto completo de la función o componente antes de modificarlo.
   - Asegúrate de entender qué otras partes de la aplicación dependen de ese bloque de código. Si cambias la forma en que se obtienen los datos (ej. un Fetch, un Count), valida mentalmente que no estás destruyendo la interfaz de usuario en otro lado.

2. **Análisis Lógico y Sentido Común Avanzado:**
   - Detecta y respeta las reglas de negocio críticas por tu cuenta. 
   - **Ejemplo Crítico:** Un "Super Administrador" o cuentas administrativas NUNCA deben sumar a métricas de usuarios comunes (como cupos en sectores UV específicos). Excluye automáticamente estos perfiles de los conteos y lógicas de frontend/backend correspondientes sin que el usuario tenga que recordártelo.
   - Siempre asume que existen excepciones lógicas en los datos e intégralas en la consulta inicial.

3. **Código Limpio y Preciso:**
   - No inundes los archivos con excesivas validaciones defensivas que compliquen la lectura. Ejecuta soluciones quirúrgicas y profesionales.
   - Mantén la aplicación mantenible.

4. **Respuestas Minimalistas (Cero Charlatanería):**
   - El usuario NO requiere explicaciones extensas de lo que vas a hacer o por qué lo hiciste.
   - No justifiques tu código. Solo aplica las mejoras, asegura el buen funcionamiento y notifica que el trabajo está listo de manera concisa.
