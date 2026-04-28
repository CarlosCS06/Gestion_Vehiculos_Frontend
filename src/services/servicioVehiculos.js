import { fetchWithLogging } from './apiUtils';

const AUTH_API_URL = 'https://gestion-vehiculos-backend.vercel.app/api/vehiculos';

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
    gastoPorKm: v.gastoPorKm || 0,
    foto: fotoUrl,
    fotoHover: hoverUrl,
    trayectos: v.trayectos || [],
    revisiones: v.revisiones || [],
    averias: v.averias || [],
    proximaItv: v.proximaItv || '',
    estado: v.estado ? v.estado.toLowerCase() : 'disponible',
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
    gastoPorKm: Number(vehiculo.gastoPorKm || 0),
    estado: vehiculo.estado,
    proximaItv: vehiculo.proximaItv,
    foto: vehiculo.foto,
    idImagen: vehiculo.idImagen,
    fotoHover: vehiculo.fotoHover,
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
  const token = sessionStorage.getItem('token');

  // Normalizar para el backend (Prisma schema)
  const normalizedDatos = {
    matricula: datosActualizados.matricula,
    marca: datosActualizados.marca,
    modelo: datosActualizados.modelo,
    fechaCompra: datosActualizados.fechaCompra ? new Date(datosActualizados.fechaCompra).toISOString() : undefined,
    anyosAntiguedad: datosActualizados.anyosAntiguedad !== undefined ? Number(datosActualizados.anyosAntiguedad) : undefined,
    tipo: datosActualizados.tipo,
    kilometrosTotales: datosActualizados.kilometrosTotales !== undefined ? Number(datosActualizados.kilometrosTotales) : undefined,
    alimentacion: datosActualizados.alimentacion,
    precio: datosActualizados.precio !== undefined ? Number(datosActualizados.precio) : undefined,
    nuevo: datosActualizados.nuevo !== undefined ? Boolean(datosActualizados.nuevo) : undefined,
    gastoPorKm: datosActualizados.gastoPorKm !== undefined ? Number(datosActualizados.gastoPorKm) : undefined,
    estado: datosActualizados.estado,
    proximaItv: datosActualizados.proximaItv,
    foto: datosActualizados.foto,
    idImagen: datosActualizados.idImagen,
    fotoHover: datosActualizados.fotoHover,
  };

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

/**
 * Calcula la periodicidad de la ITV según el tipo y antigüedad
 */
export const obtenerPeriodicidadITV = (tipo, antiguedad) => {
  if (tipo === 'Turismo' || tipo === 'Motocicleta') {
    if (antiguedad < 4) return { texto: 'Exento', años: 4 - antiguedad };
    if (antiguedad < 10) return { texto: 'Cada 2 años', años: 2 };
    return { texto: 'Cada año', años: 1 };
  }

  if (tipo === 'Ciclomotor') {
    if (antiguedad < 3) return { texto: 'Exento', años: 3 - antiguedad };
    return { texto: 'Cada 2 años', años: 2 };
  }

  if (tipo === 'Furgoneta') {
    if (antiguedad < 2) return { texto: 'Exento', años: 2 - antiguedad };
    if (antiguedad < 6) return { texto: 'Cada 2 años', años: 2 };
    if (antiguedad < 10) return { texto: 'Cada año', años: 1 };
    return { texto: 'Cada 6 meses', años: 0.5 };
  }

  if (tipo === 'Caravana') {
    if (antiguedad < 6) return { texto: 'Exento', años: 6 - antiguedad };
    return { texto: 'Cada 2 años', años: 2 };
  }

  if (tipo === 'Camión' || tipo === 'Autobús') {
    if (antiguedad < 10) return { texto: 'Cada año', años: 1 };
    return { texto: 'Cada 6 meses', años: 0.5 };
  }

  return { texto: 'No definida', años: 0 };
};

/**
 * Calcula el año sugerido de la próxima ITV
 */
export const calcularProximaItvSugerida = (tipo, antiguedad) => {
  const periodicidad = obtenerPeriodicidadITV(tipo, antiguedad);
  if (periodicidad.años === 0) return 'Por especificar';

  const anyoActual = new Date().getFullYear();
  const proximoAnyo = anyoActual + periodicidad.años;

  return `${Math.floor(proximoAnyo)} (Pendiente)`;
};
