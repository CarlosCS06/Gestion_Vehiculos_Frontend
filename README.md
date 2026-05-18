# FlotaGest - Gestión Inteligente de Flotas de Vehículos🚚

## 📝 ÍNDICE DE LA DOCUMENTACIÓN
1. [Introducción y Justificación](#1-introducción-y-justificación)
2. [Arquitectura y Stack Tecnológico](#2-arquitectura-y-stack-tecnológico)
3. [Enlace de Producción y Despliegue](#3-enlace-de-producción-y-despliegue)
4. [Guía de Instalación y Ejecución Local](#4-guía-de-instalación-y-ejecución-local)
5. [Validación y Pruebas del Proyecto](#5-validación-y-pruebas-del-proyecto)
6. [Retos Técnicos y Lecciones Aprendidas](#6-retos-técnicos-y-lecciones-aprendidas)
7. [Conclusión e Información Relevante](#7-conclusión-e-información-relevante)

---

## 1. Introducción y Justificación
- **Problema que solventa**: En el sector de la logística y el transporte, la gestión del estado de los vehículos, las hojas de ruta de los conductores, el consumo de combustible y los mantenimientos preventivos a menudo se llevan en sistemas desconectados (Excel, papel). Esto genera descontrol en los gastos, errores en el encadenamiento de rutas y vehículos inactivos por mala planificación.
- **Finalidad de la solución**: FlotaGest es una plataforma web integral enfocada en automatizar y unificar todas estas tareas. Su objetivo principal es asegurar la integridad de la información (mediante estrictas validaciones), agilizar el alta de registros y dar una visión en tiempo real (Dashboard) del estado de toda la flota (vehículos disponibles, en ruta o averiados), optimizando así los tiempos operativos.

## 2. Arquitectura y Stack Tecnológico
- **Tecnologías utilizadas**:
  - **Frontend**: Desarrollado con **React.js** y **Vite** para garantizar máxima velocidad de desarrollo y compilación.
  - **Interfaz de Usuario (UI)**: Se utiliza la librería **Fluent UI** de Microsoft, proporcionando un diseño profesional, limpio y altamente accesible (formularios interactivos, modales y tarjetas dinámicas).
  - **Backend y API**: Conexión a una API REST (Node.js/Express) que utiliza **Prisma ORM** como capa de datos.
  - **Manejo de Imágenes**: Integración con **Cloudinary** para carga y hosting dinámico de perfiles y vehículos.
- **Modelo de datos**: El sistema pivota alrededor de entidades fuertemente tipadas:
  - `Vehículo` (información técnica, consumo de combustible, revisiones ITV con descripción detallada e historial).
  - `Conductor` (perfiles validados algorítmicamente y enlazados a rutas).
  - `Viajes y Trayectos` (modelo jerárquico donde 1 Viaje = N Trayectos encadenados lógicamente por horarios y destinos).
  - `Averías / Revisiones` (gestión del ciclo de vida del mantenimiento, incluyendo campos descriptivos en revisiones e informes de taller).
  - `Usuario` (control de acceso y credenciales con roles `admin`, `user` o mixtos, y control de activación).

## 3. Enlace de Producción y Despliegue
- **Enlace al proyecto en vivo**: https://gestion-vehiculos-frontend.vercel.app/
- **Flujo de despliegue continuo (CI/CD)**: La aplicación está conectada directamente al repositorio oficial. Gracias a la integración con **Vercel**, cada vez que se suben nuevos cambios (*push*) a la rama `main` en GitHub, Vercel detecta las modificaciones, compila el código y actualiza la aplicación en producción de forma 100% automática en cuestión de segundos, sin cortes de servicio.

## 4. Guía de Instalación y Ejecución Local
**Requisitos previos**:
Para poder correr este proyecto en tu propia máquina necesitarás tener instalados:
- [Node.js](https://nodejs.org/es/) (Versión 16 o superior).
- [Git](https://git-scm.com/downloads) para clonar el proyecto.

**Pasos para arrancar el proyecto**:
1. **Clonar el repositorio**:
   Abre una terminal y descarga el código fuente:
   ```bash
   git clone https://github.com/CarlosCS06/Gestion_Vehiculos_Frontend.git
   cd Gestion_Vehiculos_Frontend
   ```
2. **Instalar las dependencias**:
   Ejecuta NPM para descargar la carpeta `node_modules`:
   ```bash
   npm install
   ```
3. **Configuración de variables de entorno**:
   En la raíz del proyecto, asegúrate de tener configurada la URL a tu API backend (si no existe el archivo `.env`, puedes crearlo):
   ```env
   VITE_API_URL=https://gestion-vehiculos-backend.vercel.app/api
   ```
4. **Arrancar el entorno de desarrollo**:
   ```bash
   npm run dev
   ```
   Abre tu navegador y entra en la ruta que te proporcione la consola (por defecto será `http://localhost:5173/`).

## 5. Validación y Pruebas del Proyecto
El proyecto cuenta con un sistema de prevención de errores muy estricto para garantizar que los datos siempre sean fiables:
- **Validaciones reales (Identidad)**: Algoritmo real matemático para validar la letra del DNI o NIE español en el alta de conductores y en la creación de usuarios. Validación de formato de teléfono (+34) estricto.
- **Validaciones de negocio (Fechas y Edad)**: El sistema bloquea altas de conductores menores de edad (18 años). En vehículos, verifica que la fecha de matriculación no sea posterior a la de compra.
- **Coherencia de rutas**: Al registrar un viaje con múltiples trayectos, el formulario exige que la "Fecha y hora de llegada" del trayecto siempre sea posterior a la de "Salida", y fuerza la lógica de encadenamiento (el destino de un trayecto es el origen del siguiente).
- **Seguridad Multirrol (Admin vs Conductor)**: Implementación de guardia de rutas en el cliente (bloqueando y redirigiendo a usuarios sin privilegios que intenten acceder al panel de `/usuarios`) y filtrado estricto de campos (*payload hardening*) al guardar incidencias. Esto garantiza que un conductor normal jamás pueda alterar campos de taller o resolver averías, ni siquiera manipulando el estado del navegador local.

## 6. Retos Técnicos y Lecciones Aprendidas
- **Sincronización global del estado**:
  - *Desafío*: Fue complicado mantener sincronizado el estado del `Vehículo` (saber si estaba Disponible o En Trayecto) basándose en las acciones ocurridas dentro de la vista de `Viajes`.
  - *Solución*: Implementamos un motor de validación en la recarga del módulo que identifica los vehículos que tienen rutas activas en ese instante y lanza peticiones asíncronas para corregir los estados en la base de datos de manera invisible para el usuario.
- **Manipulación de fechas entre Sistemas (ISO vs HTML5)**:
  - *Desafío*: Las disparidades de formato de fechas al enviar objetos JSON al Backend y al leerlos en inputs nativos de tipo `date` o `datetime-local` en React causaban caídas (crashes).
  - *Solución*: Creación de utilidades universales de formateo (`dateUtils.js`) para parsear de forma segura toda fecha entrante y saliente del sistema.
- **Seguridad en Payload frente a Modificación Local de Estados**:
  - *Desafío*: Para cumplir con el requerimiento de que los conductores no pudiesen resolver averías ni ver/escribir datos técnicos de taller, no era suficiente con ocultar inputs en el formulario (un conductor avanzado podría usar las herramientas del desarrollador del navegador para forzar propiedades).
  - *Solución*: Diseñamos un blindaje en la construcción de los datos de envío (*payload hardening*) en el método de guardado. Si el usuario logueado no es administrador, cualquier campo de fechas de taller o estado de resolución se descarta y se fuerza estrictamente a `null` / `false` antes de salir al backend, blindando la lógica de negocio contra intrusiones locales.

## 7. Conclusión e Información Relevante
- **Información importante / Limitaciones**: 
  - Actualmente las actualizaciones en tiempo real dependen en ciertas vistas de recargas periódicas ligeras (polling cada 60 segundos en viajes), debido a la ausencia de integraciones nativas con WebSockets en la versión actual de la API.
- **Líneas de trabajo futuras**:
  - **Geolocalización real**: Sustituir el sistema actual de enlaces estáticos de estaciones de servicio (Google Maps) por un mapa interactivo incrustado en el dashboard que trace las rutas de los trayectos.
  - **Exportación de analíticas**: Permitir descargar toda la trazabilidad del gasto de vehículos en formato PDF o CSV para gestorías.
  - **Multiroles complejos**: Añadir permisos específicos para "Mecánicos" que limiten su entorno exclusivamente al registro técnico de Averías y Revisiones, sin acceso a los datos personales de la plantilla de conductores.
