import { fetchWithLogging } from './apiUtils';
import { ESTADO_VEHICULO } from '../models/Vehiculo.js';

const AUTH_API_URL = (import.meta.env.VITE_API_URL || 'https://gestion-vehiculos-backend.vercel.app/api') + '/vehiculos';

const mapearVehiculo = (v) => {
  // Mapeo de imágenes: primera para principal, segunda para hover (si existe)
  const imagenes = v.imagenes || [];
  let fotoUrl = imagenes.length > 0 ? imagenes[0].url : (v.foto || '');
  let hoverUrl = imagenes.length > 1 ? imagenes[1].url : '';

  // Intercambio específico para la Toyota Hilux solicitado por el usuario
  if (v.marca === 'Toyota' && v.modelo === 'Hilux' && imagenes.length >= 2) {
    [fotoUrl, hoverUrl] = [hoverUrl, fotoUrl];
  }

  const vehiculo = {
    ...v,
    kilometrosTotales: v.kilometrosTotales || 0,
    anyosAntiguedad: Number(v.anyosAntiguedad || 0),
    precio: v.precio || 0,
    gastoCombustiblePorKiloetro: v.gastoCombustiblePorKiloetro || v.gastoPorKm || 0,
    tipoGastoVehiculo: v.tipoGastoVehiculo || 'LITROS',
    capacidadTanqueCombustible: v.capacidadTanqueCombustible || 0,
    fechaMatriculacion: v.fechaMatriculacion || '',
    foto: fotoUrl,
    fotoHover: hoverUrl,
    trayectos: v.trayectos || [],
    revisiones: v.revisiones || [],
    averias: v.averias || [],
    proximaItv: v.proximaItv || '',
    plantillas: Array.isArray(v.plantillas)
      ? v.plantillas.map((p) => (typeof p === 'object' ? p.id : p)).filter((id) => id !== undefined && id !== null).map(String)
      : [],
    estado: v.estado ? v.estado.toUpperCase() : ESTADO_VEHICULO.DISPONIBLE,
    idImagen: v.idImagen || null,
  };

  // Lógica de Autocorrección Automática al recibir datos
  if (vehiculo.proximaItv && vehiculo.proximaItv.includes('-')) {
    const hoy = new Date();
    const fechaItv = new Date(vehiculo.proximaItv);

    // Si la fecha ya ha pasado (ayer o antes)
    if (fechaItv < hoy.setHours(0, 0, 0, 0)) {
      const periodicidad = obtenerPeriodicidadITV(vehiculo.tipo, vehiculo.anyosAntiguedad);
      if (periodicidad.años > 0) {
        // Calculamos el próximo año estimado
        const proximoAnio = new Date().getFullYear() + periodicidad.años;
        vehiculo.proximaItv = `${proximoAnio} (Pendiente)`;
      }
    }
  }

  return vehiculo;
};

export const obtenerVehiculos = async () => {
  const token = sessionStorage.getItem('token');
  const response = await fetchWithLogging(AUTH_API_URL, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const datos = await response.json();
  return Array.isArray(datos) ? datos.map(mapearVehiculo) : [];
};

export const obtenerVehiculoPorMatricula = async (matricula) => {
  const token = sessionStorage.getItem('token');
  const response = await fetchWithLogging(`${AUTH_API_URL}/${matricula}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const dato = await response.json();
  return dato ? mapearVehiculo(dato) : null;
};

export const crearVehiculo = async (vehiculo) => {
  const token = sessionStorage.getItem('token');

  // Normalizar para el backend (Prisma schema)
  const normalizedVehiculo = {
    matricula: vehiculo.matricula,
    marca: vehiculo.marca,
    modelo: vehiculo.modelo,
    fechaCompra: vehiculo.fechaCompra ? new Date(vehiculo.fechaCompra).toISOString() : new Date().toISOString(),
    anyosAntiguedad: Number(vehiculo.anyosAntiguedad || 0),
    tipo: vehiculo.tipo,
    kilometrosTotales: Number(vehiculo.kilometrosTotales || 0),
    alimentacion: vehiculo.alimentacion,
    precio: Number(vehiculo.precio || 0),
    nuevo: Boolean(vehiculo.nuevo),
    gastoCombustiblePorKiloetro: Number(vehiculo.gastoCombustiblePorKiloetro || 0),
    tipoGastoVehiculo: vehiculo.tipoGastoVehiculo || 'LITROS',
    capacidadTanqueCombustible: Number(vehiculo.capacidadTanqueCombustible || 0),
    fechaMatriculacion: vehiculo.fechaMatriculacion ? new Date(vehiculo.fechaMatriculacion).toISOString() : undefined,
    estado: vehiculo.estado,
    proximaItv: vehiculo.proximaItv,
    plantillas: Array.isArray(vehiculo.plantillas)
      ? vehiculo.plantillas.map((p) => (typeof p === 'object' ? p.id : p)).filter((id) => id !== undefined && id !== null)
      : [],
    plantillasEliminar: Array.isArray(vehiculo.plantillasEliminar)
      ? vehiculo.plantillasEliminar.map((p) => (typeof p === 'object' ? p.id : p)).filter((id) => id !== undefined && id !== null)
      : [],
    foto: vehiculo.foto,
    idImagen: vehiculo.idImagen,
    fotoHover: vehiculo.fotoHover,
    imagenes: Array.isArray(vehiculo.imagenes) ? vehiculo.imagenes.map(img => typeof img === 'object' ? img.id : img) : [],
  };

  const response = await fetchWithLogging(AUTH_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(normalizedVehiculo),
  });
  return response.json();
};

export const actualizarVehiculo = async (matricula, datosActualizados) => {

  // Construir objeto solo con los campos que vienen en datosActualizados
  const normalizedDatos = {};

  if (datosActualizados.matricula !== undefined) normalizedDatos.matricula = datosActualizados.matricula;
  if (datosActualizados.marca !== undefined) normalizedDatos.marca = datosActualizados.marca;
  if (datosActualizados.modelo !== undefined) normalizedDatos.modelo = datosActualizados.modelo;
  if (datosActualizados.fechaCompra !== undefined) normalizedDatos.fechaCompra = new Date(datosActualizados.fechaCompra).toISOString();
  if (datosActualizados.anyosAntiguedad !== undefined) normalizedDatos.anyosAntiguedad = Number(datosActualizados.anyosAntiguedad);
  if (datosActualizados.tipo !== undefined) normalizedDatos.tipo = datosActualizados.tipo;
  if (datosActualizados.kilometrosTotales !== undefined) normalizedDatos.kilometrosTotales = Number(datosActualizados.kilometrosTotales);
  if (datosActualizados.alimentacion !== undefined) normalizedDatos.alimentacion = datosActualizados.alimentacion;
  if (datosActualizados.precio !== undefined) normalizedDatos.precio = Number(datosActualizados.precio);
  if (datosActualizados.nuevo !== undefined) normalizedDatos.nuevo = Boolean(datosActualizados.nuevo);
  if (datosActualizados.gastoCombustiblePorKiloetro !== undefined) normalizedDatos.gastoCombustiblePorKiloetro = Number(datosActualizados.gastoCombustiblePorKiloetro);
  if (datosActualizados.tipoGastoVehiculo !== undefined) normalizedDatos.tipoGastoVehiculo = datosActualizados.tipoGastoVehiculo;
  if (datosActualizados.capacidadTanqueCombustible !== undefined) normalizedDatos.capacidadTanqueCombustible = Number(datosActualizados.capacidadTanqueCombustible);
  if (datosActualizados.fechaMatriculacion !== undefined) normalizedDatos.fechaMatriculacion = new Date(datosActualizados.fechaMatriculacion).toISOString();
  if (datosActualizados.estado !== undefined) normalizedDatos.estado = datosActualizados.estado;
  if (datosActualizados.proximaItv !== undefined) normalizedDatos.proximaItv = datosActualizados.proximaItv;
  if (datosActualizados.foto !== undefined) normalizedDatos.foto = datosActualizados.foto;
  if (datosActualizados.idImagen !== undefined) normalizedDatos.idImagen = datosActualizados.idImagen;
  if (datosActualizados.fotoHover !== undefined) normalizedDatos.fotoHover = datosActualizados.fotoHover;
  if (datosActualizados.plantillas !== undefined) {
    normalizedDatos.plantillas = Array.isArray(datosActualizados.plantillas)
      ? datosActualizados.plantillas.map((p) => (typeof p === 'object' ? p.id : p)).filter((id) => id !== undefined && id !== null)
      : [];
  }
  if (datosActualizados.plantillasEliminar !== undefined) {
    normalizedDatos.plantillasEliminar = Array.isArray(datosActualizados.plantillasEliminar)
      ? datosActualizados.plantillasEliminar.map((p) => (typeof p === 'object' ? p.id : p)).filter((id) => id !== undefined && id !== null)
      : [];
  }
  if (datosActualizados.imagenes !== undefined) {
    normalizedDatos.imagenes = Array.isArray(datosActualizados.imagenes) ? datosActualizados.imagenes.map(img => typeof img === 'object' ? img.id : img) : [];
  }

  const token = sessionStorage.getItem('token');
  const response = await fetchWithLogging(`${AUTH_API_URL}/${matricula}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(normalizedDatos),
  });
  return response.json();
};

export const eliminarVehiculo = async (matricula) => {
  const token = sessionStorage.getItem('token');
  const response = await fetchWithLogging(`${AUTH_API_URL}/${matricula}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
};

export const obtenerVehiculosAveriados = async () => {
  const token = sessionStorage.getItem('token');
  const response = await fetchWithLogging(`${AUTH_API_URL}/avariados`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
};

