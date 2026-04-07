import { fetchWithLogging } from './apiUtils';

const AUTH_API_URL = 'https://gestion-vehiculos-backend.vercel.app/api/vehiculos';

const mapearVehiculo = (v) => ({
  ...v,
  kmTotales: v.kilometrosTotales || 0,
  aniosAntiguedad: Number(v.anyosAntiguedad || 0),
  precioCompra: v.precio || 0,
  gastoPorKm: v.gastoPorKm || 0,
  foto: v.imagenes && v.imagenes.length > 0 ? v.imagenes[0].url : (v.foto || ''),
  trayectos: v.trayectos || [],
  revisiones: v.revisiones || [],
  averias: v.averias || [],
});

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
    anyosAntiguedad: Number(vehiculo.aniosAntiguedad || 0),
    tipo: vehiculo.tipo,
    kilometrosTotales: Number(vehiculo.kmTotales || 0),
    alimentacion: vehiculo.alimentacion,
    precio: Number(vehiculo.precioCompra || 0),
    nuevo: Boolean(vehiculo.nuevo),
    gastoPorKm: Number(vehiculo.gastoPorKm || 0),
  };

  // Manejar imágenes si existe el ID de la imagen
  if (vehiculo.idImagen) {
    normalizedVehiculo.imagenes = [{ id: Number(vehiculo.idImagen) }]; // El backend espera un array de objetos { id }
  }

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
    anyosAntiguedad: datosActualizados.aniosAntiguedad !== undefined ? Number(datosActualizados.aniosAntiguedad) : undefined,
    tipo: datosActualizados.tipo,
    kilometrosTotales: datosActualizados.kmTotales !== undefined ? Number(datosActualizados.kmTotales) : undefined,
    alimentacion: datosActualizados.alimentacion,
    precio: datosActualizados.precioCompra !== undefined ? Number(datosActualizados.precioCompra) : undefined,
    nuevo: datosActualizados.nuevo !== undefined ? Boolean(datosActualizados.nuevo) : undefined,
    gastoPorKm: datosActualizados.gastoPorKm !== undefined ? Number(datosActualizados.gastoPorKm) : undefined,
  };

  // Manejar imágenes en la actualización si hay datos (id, url, nombre) para connectOrCreate
  if (datosActualizados.idImagen) {
    normalizedDatos.imagenes = [{ 
      id: Number(datosActualizados.idImagen),
      url: datosActualizados.foto || '',
      nombre: datosActualizados.nombreImagen || 'vehiculo_imagen'
    }];
  }

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
    if (antiguedad < 4) return 'Exento';
    if (antiguedad < 10) return 'Cada 2 años';
    return 'Cada año';
  }

  if (tipo === 'Ciclomotor') {
    if (antiguedad < 3) return 'Exento';
    return 'Cada 2 años';
  }

  if (tipo === 'Furgoneta') {
    if (antiguedad < 2) return 'Exento';
    if (antiguedad < 6) return 'Cada 2 años';
    if (antiguedad < 10) return 'Cada año';
    return 'Cada 6 meses';
  }

  if (tipo === 'Caravana') {
    if (antiguedad < 6) return 'Exento';
    return 'Cada 2 años';
  }

  if (tipo === 'Camión' || tipo === 'Autobús') {
    if (antiguedad < 10) return 'Cada año';
    return 'Cada 6 meses';
  }

  return 'No definida';
};
