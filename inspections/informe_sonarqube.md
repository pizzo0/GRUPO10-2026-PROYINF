# Informe de Inspección de Código (Sonarqube)

## 1. Hallazgos Iniciales
Se conectó el repositorio a la herramienta SonarCloud para realizar el análisis estático del código. Durante la inspección en el backend, se identificaron *Quality Issues* y Vulnerabilidades Críticas en el controlador principal del Wizard (`backend/controllers/wizard.js`). Las capturas de pantalla de estos hallazgos se encuentran versionadas en esta misma carpeta:

* **Issue 1: Code Smell (Módulos de Node)**
    * **Mensaje:** *Prefer `node:crypto` over `crypto` / Prefer `node:fs` over `fs`.*
    * **Problema:** Uso de importaciones heredadas en lugar del estándar moderno de Node.js, lo cual puede generar conflictos con paquetes de terceros (npm) de dudosa procedencia.
* **Issue 2: Vulnerabilidad de Seguridad (Path Traversal)**
    * **Mensaje:** *Change this code to not construct the path from user-controlled data.*
    * **Problema:** El sistema construía las rutas de guardado de archivos concatenando directamente variables provenientes de la petición del usuario (`req.wzdId` y `fieldname`). Esto abría una vulnerabilidad crítica donde un atacante podría inyectar caracteres como `../../` para sobrescribir archivos del servidor.
* **Issue 3: Vulnerabilidad de Seguridad (Denegación de Servicio)**
    * **Mensaje:** *Make sure the content length limit is safe here.*
    * **Problema:** El middleware de carga `multer` no tenía un límite máximo de tamaño configurado, exponiendo el servidor a ataques por saturación de memoria o almacenamiento si se enviaban archivos artificialmente pesados.

---

## 2. Resolución e Incorporación a la Plataforma
De acuerdo con las recomendaciones de la herramienta y los estándares de seguridad, se abordaron los problemas modificando el código de la siguiente manera:

1.  **Estandarización de Imports:** Se actualizaron todas las importaciones nativas (`crypto`, `fs`, `path`) agregando el prefijo `node:`.
2.  **Sanitización de Inputs (Path Traversal):** Se implementó la función `path.basename()` en la construcción de directorios de Multer y en la generación de las URLs. Esto asegura que el sistema extraiga únicamente el nombre base del archivo, neutralizando cualquier intento de inyección de rutas maliciosas.
3.  **Límite de Carga Segura:** Se estableció la propiedad `limits: { fileSize: 10 * 1024 * 1024 }` en la configuración de almacenamiento para restringir el tamaño máximo a 10 MB, mitigando el riesgo de DoS.

Los cambios fueron consolidados en el repositorio. Se ejecutó una re-inspección automática en SonarCloud que confirmó la resolución exitosa de todas las incidencias (ver captura del análisis en estado "Passed" / 0 issues).
