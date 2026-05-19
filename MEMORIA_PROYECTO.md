# PROYECTO DE DESARROLLO DE APLICACIONES WEB
IES INCA GARCILASO (Montilla)
**Autor:** [Tu nombre y Apellidos]
**Tutor:** [El nombre y apellidos de tu tutor docente]
**Fecha de exposición:** Junio 2025

---

## ÍNDICE DE CONTENIDO
1. [Descripción general del proyecto](#1-descripción-general-del-proyecto)
2. [Objetivos generales y objetivos específicos](#2-objetivos-generales-y-objetivos-específicos)
3. [Análisis previo de ideas según los objetivos del proyecto](#3-análisis-previo-de-ideas-según-los-objetivos-del-proyecto)
4. [Justificación de la opción, camino o solución escogida](#4-justificación-de-la-opción-camino-o-solución-escogida)
5. [Recursos necesarios](#5-recursos-necesarios)
6. [Desarrollo del Proyecto](#6-desarrollo-del-proyecto)
7. [Manual básico de utilización para el usuario](#7-manual-básico-de-utilización-para-el-usuario)
8. [Dificultades encontradas](#8-dificultades-encontradas)
9. [Conclusiones](#9-conclusiones)
10. [Posibles Mejoras](#10-posibles-mejoras)
11. [Fuentes de Información y recursos utilizados](#11-fuentes-de-información-y-recursos-utilizados)

---

## 1. Descripción general del proyecto
**FlotaGest** es una plataforma integral de gestión empresarial dirigida a entidades del sector del transporte, la logística o el alquiler de vehículos que requieren controlar de manera eficiente su flota. Estas empresas disponen de personal de oficina (administradores y gestores de tráfico) que operan con equipos de escritorio, y conductores en ruta que acceden a la información a través de dispositivos móviles. El proyecto soluciona los habituales problemas de desorganización y la dependencia del papel mediante una aplicación web centralizada, accesible en tiempo real y adaptada a cualquier pantalla.

## 2. Objetivos generales y objetivos específicos. 
**Objetivos generales:**
* Digitalizar y centralizar por completo la gestión operativa de una flota de vehículos, eliminando la dependencia de hojas de cálculo y documentos físicos.
* Mejorar la comunicación en tiempo real entre los gestores en la oficina y los conductores en ruta.

**Objetivos específicos:**
* Automatizar el control de mantenimientos y alertas de ITV predictivas.
* Desarrollar un sistema de encadenamiento lógico de trayectos para formar hojas de ruta coherentes.
* Gestionar de forma dinámica el estado del vehículo (Disponible, Averiado, En trayecto, En taller) en base a los viajes y averías registradas.
* Establecer un sistema de roles estricto donde los conductores solo puedan visualizar su información y reportar incidencias, mientras los administradores mantienen el control total y financiero.

## 3. Análisis previo de ideas según los objetivos del proyecto
Para lograr estos objetivos, se planteó el desarrollo de una Aplicación Web de Página Única (SPA) moderna, rápida y reactiva que funcionara como una PWA (Progressive Web App) para facilitar su uso en móviles.
* **Frontend:** Implementar una interfaz gráfica profesional y corporativa utilizando componentes de diseño prefabricados de alto nivel, conectada a un servidor backend mediante peticiones HTTP (API REST).
* **Backend:** Crear un servidor encargado de la persistencia de datos, la validación de reglas de negocio complejas (como solapamientos de fechas) y la autenticación mediante tokens de seguridad (JWT).

## 4. Justificación de la opción, camino o solución escogida
* **React + Vite:** Se escogió la librería React por su capacidad para crear interfaces interactivas e instantáneas, y Vite como empaquetador para garantizar tiempos de compilación muy rápidos.
* **Microsoft Fluent UI:** Se optó por el sistema de diseño de Microsoft (Fluent UI) en lugar de alternativas como Bootstrap o Tailwind puro, para dotar a la aplicación de un aspecto "Enterprise" altamente profesional y accesible.
* **Autenticación JWT:** Se escogió para mantener sesiones seguras sin estado, permitiendo a la API verificar permisos de forma rápida.
* **Diseño "Mobile-First":** Justificado por la naturaleza del trabajo de los conductores, obligando a usar menús de navegación inferiores e interfaces táctiles en la vista móvil.

## 5. Recursos necesarios
**Hardware:**
* Ordenador personal para el desarrollo (PC/Portátil).
* Dispositivos móviles (Android/iOS) para la realización de pruebas de interfaz en entornos reales.

**Software:**
* Visual Studio Code como IDE principal.
* Node.js y gestor de paquetes npm.
* Git para el control de versiones local.
* Navegadores web con herramientas de desarrollador (Chrome/Edge/Firefox).

**Servicios online:**
* **Repositorios:** GitHub para alojar el código fuente.
* **Servidores de despliegue:** Vercel para el alojamiento en producción tanto del backend como del frontend.
* **Base de datos:** Servicio en la nube (PostgreSQL/MySQL) conectado mediante Prisma ORM.
* **Almacenamiento de imágenes:** Cloudinary para alojar las fotografías de perfil y de vehículos.

## 6. Desarrollo del Proyecto

### Implantación de software
El desarrollo comenzó con la inicialización del proyecto mediante `create-vite`, seguido de la instalación de dependencias clave (`react-router-dom`, `@fluentui/react-components`). A nivel de backend, se estructuró la API y la conexión a la base de datos usando Prisma. La implantación en producción se realiza conectando las ramas principales del repositorio de GitHub directamente con Vercel para lograr Integración Continua (CI/CD).

### Programación
* **Guía de estilo:** Se siguió el estándar de la comunidad (CamelCase para variables y funciones, PascalCase para componentes React). El código se estructuró para ser semántico y auto-explicativo.
* **Organización física:** Arquitectura modular (`/src` dividido en `/components`, `/pages`, `/services`, `/models`, y `/context`).
* **Funciones:** Se utilizó programación funcional (Hooks de React como `useState`, `useEffect`, `useCallback`) y funciones asíncronas puras para las llamadas a la API en la capa de servicios.

### Base de datos
El modelo relacional se diseñó para mantener la integridad referencial. Entidades principales:
* `Usuario` y `Conductor` (relación 1:1 o gestión de credenciales).
* `Vehiculo`, relacionado con `Viaje`, `Averia` y `Revision` (1:N).
* `Viaje`, que actúa como cabecera y contiene múltiples `Trayecto` (1:N).

### Desarrollo web
* **Estructura y Maqueta:** Layout dinámico que muestra un panel lateral (Sidebar) en escritorio y una barra de navegación inferior (Bottom Navigation) en móviles.
* **Adaptabilidad (Responsive) y Usabilidad:** Uso intenso de Media Queries, flexbox y CSS Grid. Los formularios (como la creación de trayectos encadenados) rellenan automáticamente los campos lógicos (como el origen del nuevo trayecto basado en el destino del anterior) para maximizar la usabilidad.

### Aplicación Web Progresiva (PWA)
* Se implementó un *Service Worker* (`sw.js`) para manejar el almacenamiento en caché de los activos estáticos y preparar la aplicación para futuras capacidades offline.
* El archivo de manifiesto web define los iconos y permite la "instalación" nativa del panel en dispositivos móviles.

### Control de versiones y Despliegue
* **Control de versiones:** [Enlace a tu repositorio de GitHub]
* **Despliegue:** [Enlace a la app desplegada (ej. Vercel)]

## 7. Manual básico de utilización para el usuario
A continuación, se detalla un resumen del funcionamiento básico según el **Manual del Cliente**:

* **Acceso y Roles:** El sistema distingue entre *Administradores* (acceso y edición global) y *Conductores* (acceso restringido a sus rutas y creación de incidencias). Los registros nuevos requieren la validación matemática de documentos oficiales (DNI) y activación manual por un administrador.
* **Vehículos:** El panel de flota muestra tarjetas de vehículos en tiempo real con su estado (Disponible, En trayecto, Averiado, En revisión) y alerta automáticamente si una ITV está vencida.
* **Viajes y Trayectos:** Los administradores asignan viajes. El sistema exige que los trayectos sean coherentes cronológica y geográficamente. Al asignar un viaje, el vehículo entra automáticamente en estado *En trayecto*.
* **Averías:** Cualquier incidencia mecánica marca automáticamente al vehículo como averiado. El vehículo solo volverá a estar operativo cuando un administrador edite el parte, introduzca los detalles del taller y marque la casilla de avería como "Resuelta".
* **Revisiones:** Mediante el uso de "Plantillas", se configuran las alertas de mantenimiento por tiempo (meses) o por kilometraje. Al revisar el vehículo, el formulario mostrará claramente la marca y matrícula del coche afectado, asegurando la integridad visual de los datos.

## 8. Dificultades encontradas
* **Lógica de Estado Cruzado (Backend/Frontend):** Sincronizar el estado del vehículo (disponible/averiado/en trayecto) de forma automatizada cuando se creaban, borraban o editaban viajes y averías requirió una lógica estricta para evitar "estados fantasma".
* **Estructuras de Datos Complejas:** El manejo de "Trayectos" anidados dentro de "Viajes" y garantizar que no se duplicaran registros al actualizar requirió una normalización exhaustiva de los IDs en las llamadas a la API.
* **Validación de Relaciones:** Tratar con variaciones en las respuestas del backend (por ejemplo, cuando la matrícula venía como un string plano versus un objeto anidado) exigió crear funciones unificadas y robustas en el lado del cliente.

## 9. Conclusiones
El desarrollo de FlotaGest demuestra la eficacia de las aplicaciones web modernas para resolver problemas logísticos tradicionales. Se ha logrado crear un ecosistema seguro, visualmente sobresaliente (con un fuerte diseño Enterprise) y con una inteligencia de negocio que automatiza los tediosos cálculos de ITV, mantenimientos y control de estados, cumpliendo satisfactoriamente todos los objetivos propuestos.

## 10. Posibles Mejoras
* **Integración IoT / GPS:** Incorporar hardware de geolocalización en los vehículos para actualizar los kilómetros recorridos de forma pasiva y mostrar ubicaciones en un mapa en tiempo real.
* **Aplicación Nativa:** Evolucionar la PWA hacia una aplicación React Native nativa para poder utilizar notificaciones Push directas en el móvil del conductor cuando se le asigne una nueva ruta.
* **Gestión Documental Avanzada:** Sistema OCR (Reconocimiento Óptico de Caracteres) para escanear facturas de combustible o partes de taller con la cámara del móvil.

## 11. Fuentes de Información y recursos utilizados
* **React Documentation:** Referencia oficial para el ciclo de vida y hooks. (https://react.dev)
* **Fluent UI React v9:** Guía de diseño y componentes proporcionados por Microsoft. (https://react.fluentui.dev)
* **Vite:** Documentación sobre la compilación y variables de entorno. (https://vitejs.dev)
* **Prisma ORM:** Guía para el modelado de bases de datos relacionales en el backend. (https://www.prisma.io)
* Documentación oficial del algoritmo de validación del DNI Español del Ministerio del Interior.
