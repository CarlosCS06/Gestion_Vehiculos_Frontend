# 🚚 FlotaGest - Manual del Cliente e Instrucciones de Uso

Bienvenido al manual oficial de **FlotaGest**, la solución integral y profesional para la gestión inteligente de flotas de vehículos, conductores, planificación de viajes y control de mantenimiento predictivo.

Este documento tiene como objetivo guiar tanto a los **Administradores del Sistema** como a los **Conductores** en el uso diario de la plataforma, detallando las reglas de negocio, los flujos de trabajo y las medidas de seguridad incorporadas.

---

## 📝 ÍNDICE DE CONTENIDOS
1. [Introducción y Propósito del Sistema](#1-introducción-y-propósito-del-sistema)
2. [Estructura de Roles y Seguridad (Admin vs. Conductor)](#2-estructura-de-roles-y-seguridad-admin-vs-conductor)
3. [Guía de Acceso, Registro y Validación de Identidad](#3-guía-de-acceso-registro-y-validación-de-identidad)
4. [Módulo de Vehículos (Gestión de Flota)](#4-módulo-de-vehículos-gestión-de-flota)
5. [Módulo de Plantillas de Mantenimiento](#5-módulo-de-plantillas-de-mantenimiento)
6. [Módulo de Viajes y Trayectos (Planificación y Rutas)](#6-módulo-de-viajes-y-trayectos-planificación-y-rutas)
7. [Módulo de Revisiones y Mantenimiento Técnico](#7-módulo-de-revisiones-y-mantenimiento-técnico)
8. [Módulo de Averías e Incidencias](#8-módulo-de-averías-e-incidencias)
9. [Administración de Personal (Conductores y Cuentas de Usuario)](#9-administración-de-personal-conductores-y-cuentas-de-usuario)
10. [Módulo "Mi Perfil" (Autogestión del Conductor)](#10-módulo-mi-perfil-autogestión-del-conductor)
11. [Preguntas Frecuentes y Resolución de Problemas](#11-preguntas-frecuentes-y-resolución-de-problemas)

---

## 1. Introducción y Propósito del Sistema

**FlotaGest** resuelve los problemas logísticos de control y comunicación que suelen ocurrir al gestionar flotas mediante hojas de cálculo o papel. La aplicación centraliza los datos de:
- Hojas de ruta y encadenamiento de trayectos de forma coherente.
- Estado de actividad en tiempo real de los vehículos de la flota.
- Historial de reparaciones, gastos de combustible y costes de taller.
- Alertas automatizadas de inspección técnica de vehículos (ITV) y mantenimientos periódicos.

Toda la interfaz ha sido construida bajo la guía de diseño **Fluent UI** de Microsoft, garantizando una navegación limpia, moderna, y adaptada tanto a ordenadores como a dispositivos móviles mediante barras de navegación adaptativas y menús inferiores específicos.

---

## 2. Estructura de Roles y Seguridad (Admin vs. Conductor)

El sistema opera con dos niveles de acceso diferenciados para proteger la integridad de los datos comerciales y de taller:

### 🛡️ Administrador (Gestor de Flota)
*   **Acceso Completo**: Visualiza y gestiona todas las vistas (Vehículos, Viajes, Revisiones, Averías, Conductores, Usuarios).
*   **Gestión de Flota**: Crear, editar y eliminar vehículos.
*   **Planificación**: Crear y gestionar conductores, asignar rutas y programar revisiones ITV.
*   **Finanzas y Taller**: Registrar y modificar costes de averías, ubicaciones de reparación e informes de taller.
*   **Administración**: Activar/desactivar cuentas de usuario y cambiar roles de acceso en `/usuarios`.

### 👤 Conductor / Usuario Estándar
*   **Vistas Limitadas**: Solo tiene acceso a consultar la flota, ver sus viajes asignados, ver las revisiones previstas y reportar incidencias. La pestaña `Conductores` y el botón de `Gestión de usuarios` están completamente ocultos.
*   **Seguridad de Operaciones (Payload Hardening)**: Si un conductor intenta utilizar herramientas de desarrollo del navegador para modificar propiedades protegidas (como marcar una avería como "resuelta" o inyectar un coste de taller en el formulario), el cliente web descarta y limpia automáticamente estos datos antes de enviarlos a la API, forzándolos a `null` o `false`.
*   **Autogestión**: Puede actualizar su información de contacto (teléfono, dirección) y subir su fotografía de perfil mediante el menú lateral "Mi Perfil".

---

## 3. Guía de Acceso, Registro y Validación de Identidad

### 🔑 Formulario de Registro y Altas
Para registrarse en la plataforma, el usuario debe rellenar un formulario estructurado que cuenta con validaciones estrictas en tiempo real:

- **Validación Matemática del DNI / NIE**: El campo DNI/NIE no se limita a comprobar la longitud; implementa el algoritmo oficial del Ministerio del Interior de España. Valida que el número ingresado coincida matemáticamente con la letra calculada (división por 23). Si la letra no se corresponde, el formulario bloqueará el registro.
- **Validación de Teléfono**: El campo de teléfono exige el formato español oficial (9 dígitos numéricos, pudiendo incorporar el prefijo internacional `+34`).
- **Validación de Correo**: Verifica sintaxis de email válida (`usuario@dominio.com`).

### 🔓 Login e Inicio de Sesión
Una vez registrado, un administrador del sistema deberá **activar la cuenta** desde el panel de control de usuarios antes de que el nuevo usuario pueda iniciar sesión. Al ingresar credenciales correctas, el sistema almacena el token JWT de seguridad y da acceso al entorno de trabajo personalizado.

---

## 4. Módulo de Vehículos (Gestión de Flota)

La pestaña **Vehículos** muestra la lista completa de unidades de transporte representadas en tarjetas (*cards*) interactivas.

### 📋 Campos del Vehículo
*   **Identificación**: Matrícula (formato de matrícula español u homologados), Marca y Modelo.
*   **Historial y Valor**: Fecha de compra, fecha de matriculación (bloqueado si es posterior a la compra), kilometraje inicial y actual, precio de adquisición y condición (Nuevo/Usado).
*   **Combustible e Inteligencia**:
    *   Alimentación (Diésel, Gasolina, Híbrido, Eléctrico).
    *   Consumo medio homologado por kilómetro.
    *   Capacidad máxima del tanque en litros o kW.
*   **Imágenes dinámicas**: Soporte de imagen principal e imagen de transición (*hover*) almacenadas de manera segura en Cloudinary.

### 🔄 Estados de Actividad
Un vehículo puede encontrarse en uno de los siguientes cuatro estados:
1.  **Disponible** (Verde): Listo para realizar servicios.
2.  **En trayecto** (Azul): El vehículo está realizando un viaje activo.
3.  **Averiado** (Rojo): Tiene una incidencia abierta y no puede asignarse a nuevos viajes.
4.  **En Revisión** (Naranja): Se encuentra en el taller realizando labores de ITV o mantenimiento preventivo.

### 📅 Sistema de Alertas de ITV
El sistema calcula y evalúa la fecha de la **Próxima ITV**:
- Si la fecha de la próxima ITV registrada es anterior a la fecha actual (ITV caducada), el sistema detecta que está vencida y, aplicando la normativa según la antigüedad y tipo del vehículo, calcula de manera predictiva la siguiente fecha límite mostrando la etiqueta `(Pendiente)`.

---

## 5. Módulo de Plantillas de Mantenimiento

Para evitar que los vehículos omitan las revisiones mecánicas periódicas, FlotaGest incorpora un gestor de **Plantillas de Mantenimiento**. El uso de plantillas permite programar el mantenimiento preventivo en base al desgaste real (kilómetros) o al tiempo transcurrido (años), adaptándose a cada tipología de vehículo (camiones, turismos, furgonetas).

### ⚙️ Configuración de una Plantilla (`ModalGestionPlantilla`)
Los administradores pueden definir plantillas de mantenimiento con los siguientes parámetros:
*   **Nombre de la plantilla**: Identificador del servicio (ej. "Revisión Básica", "Cambio Filtro Aceite Camión").
*   **Es ITV Oficial**: Interruptor para clasificar si la revisión corresponde al trámite oficial del estado.
*   **Disparador (Trigger)**:
    *   *Por Antigüedad*: Se activa según los años del vehículo.
    *   *Por Kilómetros*: Se activa según los kilómetros totales del odómetro.
*   **Frecuencia**:
    *   *Cada X Meses*
    *   *Cada X Kilómetros*
*   **Margen de Cortesía (Días)**: Margen de flexibilidad temporal que el sistema otorga antes de marcar el mantenimiento como "Fuera de Plazo" en el panel de control.
*   **Rangos de Aplicación**: Permite añadir múltiples escalas operativas. Por ejemplo:
    - *Rango 1*: Desde el año 0, realizar la revisión cada 24 meses.
    - *Rango 2*: Desde el año 6, realizar la revisión cada 12 meses (debido a la fatiga de materiales).

---

## 6. Módulo de Viajes y Trayectos (Planificación y Rutas)

Los viajes representan los servicios logísticos de la empresa.

### 🔗 Lógica de Encadenamiento de Trayectos
Un **Viaje** se compone de 1 a N **Trayectos** encadenados. Para evitar inconsistencias de geolocalización o rutas imposibles, el formulario aplica validaciones estrictas:

1.  **Continuidad Geográfica**: El destino de un trayecto intermedio debe ser obligatoriamente el punto de origen del siguiente trayecto (ej. *Trayecto 1: Madrid -> Toledo. Trayecto 2: Toledo -> Ciudad Real*). El sistema autocompleta el origen del siguiente trayecto para agilizar el registro.
2.  **Lógica Temporal**: La fecha y hora de salida de un trayecto debe ser posterior a la fecha y hora de llegada del trayecto anterior.
3.  **Seguridad de Fechas**: No se permite crear trayectos cuya hora de llegada sea anterior a su propia hora de salida.

### 🔋 Sincronización Automática
Cuando un administrador da de alta un Viaje en estado `EN_CURSO` y le asigna un vehículo, el sistema actualiza automáticamente el estado del vehículo en la base de datos a **En trayecto**. Al finalizar o completar el viaje, el vehículo vuelve a estar **Disponible**.

---

## 7. Módulo de Revisiones y Mantenimiento Técnico

En esta sección se listan y programan las citas técnicas del vehículo.

### 📝 Datos de la Revisión
Al programar o registrar una revisión se capturan los siguientes campos:
*   **Vehículo**: Matrícula del vehículo inspeccionado. El sistema muestra visualmente la matrícula combinada con la marca y modelo para evitar confusiones. En modo de edición, este campo se bloquea en modo lectura para garantizar la integridad del registro.
*   **Fecha de Revisión**: Fecha programada o realizada.
*   **Plantilla Asociada**: Vincula la revisión con una regla de mantenimiento para evaluar su cumplimiento.
*   **Coste**: Coste económico de la revisión para el cálculo de ROI y gastos de flota.
*   **Descripción / Detalle**: Anotación técnica del mecánico.
*   **Informe de Taller**: Fichero o resumen técnico del diagnóstico del estado mecánico.

---

## 8. Módulo de Averías e Incidencias

Gestiona el ciclo de vida de los problemas mecánicos reportados durante los servicios de transporte.

### 🛠️ Ciclo de Vida de una Avería
1.  **Reporte inicial**: El conductor o el administrador crea la avería detallando el vehículo afectado y describiendo los síntomas o la rotura en el campo `Descripción`. La avería queda registrada en estado "No resuelta" y el vehículo pasa automáticamente a estar **Averiado**.
2.  **Inicio de reparación**: El administrador edita la avería indicando la `Fecha de comienzo de reparación` y el `Lugar de reparación` (nombre del taller). El estado del vehículo cambia a **En revisión**.
3.  **Cierre y Resolución**: Una vez reparado, el administrador introduce la `Fecha fin de reparación` y el `Coste de reparación`, y marca el selector de `Resuelta`.
4.  **Liberación de vehículo**: En el momento en que se marca la avería como resuelta, el estado del vehículo se actualiza a **Disponible** y vuelve a ser elegible para la asignación de viajes.

---

## 9. Administración de Personal (Conductores y Cuentas de Usuario)

### 🧑‍✈️ Pestaña Conductores (Solo Admin)
Muestra los perfiles profesionales de los trabajadores asignados a las rutas.
*   **Validación de Edad**: Al crear un conductor, el sistema valida su fecha de nacimiento y prohíbe el registro si el conductor es menor de 18 años.
*   **Validación DNI/NIE**: Al igual que en el registro, se valida el documento de identidad español.
*   **Gestión Documental**: Posibilidad de subir fotografías de perfil para el carné virtual del conductor.

### 👥 Pestaña Gestión de Usuarios (Solo Admin)
Ubicada en la barra de navegación superior (icono de cuentas de usuario), permite controlar el acceso al software:
*   **Tabla de Usuarios**: Listado de todos los usuarios registrados en el sistema.
*   **Activar / Desactivar Cuentas**: Un usuario recién registrado no puede entrar hasta que el administrador active el interruptor de cuenta activa.
*   **Asignar Roles**: Posibilidad de cambiar el rol de un usuario de `user` a `admin` para otorgar permisos de gestión de taller y vehículos.

---

## 10. Módulo "Mi Perfil" (Autogestión del Conductor)

Los usuarios con el rol estándar (`user`) no pueden ver la administración de otros usuarios ni la de conductores generales, pero disponen del menú lateral dinámico **Mi Perfil** para mantener sus datos al día.

### 📸 Carga de Fotografía y Datos de Contacto
*   **Actualización de Imagen**: Haciendo clic sobre su avatar, se despliega el explorador de archivos local permitiendo subir una nueva fotografía que se sube automáticamente a la nube y actualiza el menú de navegación en tiempo real.
*   **Información de Dirección y Teléfono**: Permite actualizar su calle y número de teléfono para que los administradores puedan contactarlo durante una emergencia en ruta.
*   **Cambio de Contraseña**: Permite escribir una nueva contraseña de acceso. Si se deja en blanco, el sistema conserva la contraseña existente.

---

## 11. Preguntas Frecuentes y Resolución de Problemas

### ❓ ¿Por qué un usuario nuevo no puede iniciar sesión si sus datos son correctos?
**Respuesta**: Por motivos de seguridad, todo nuevo registro se crea en estado inactivo. Un administrador debe entrar en el panel de **Gestión de Usuarios** y activar la casilla de activación de la cuenta del nuevo empleado.

### ❓ ¿Por qué no puedo guardar un trayecto si las ciudades y horas son correctas?
**Respuesta**: Compruebe la coherencia de encadenamiento. Si tiene varios trayectos en el mismo viaje, asegúrese de que el origen del trayecto actual coincida con el destino del anterior. Asimismo, verifique que la hora de llegada del trayecto no sea anterior a su salida.

### ❓ ¿Cómo se actualiza el estado de la ITV caducada si ya ha pasado de fecha?
**Respuesta**: La aplicación calcula de forma automática la próxima fecha de ITV. Si la fecha actual ha superado la fecha límite registrada y el vehículo no está en taller, aparecerá marcado como `(Pendiente)`. Una vez que se complete la inspección y el administrador registre la nueva revisión técnica con la fecha del año siguiente, el estado de alerta desaparecerá.

### ❓ ¿Por qué no puedo editar los costes de reparación de una avería desde mi cuenta de conductor?
**Respuesta**: Los costes, fechas de taller y ubicaciones de reparación de incidencias están protegidos. Solo el rol `admin` puede introducir o modificar los datos financieros y de taller de las averías.
