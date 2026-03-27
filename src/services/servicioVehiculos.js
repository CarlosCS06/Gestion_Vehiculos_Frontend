import { fetchWithLogging } from './apiUtils';

const AUTH_API_URL = 'https://gestion-vehiculos-backend.vercel.app/api/vehiculos';

export const obtenerVehiculos = async () => {
  const token = sessionStorage.getItem('token');
  const response = await fetchWithLogging(AUTH_API_URL, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
};

export const obtenerVehiculoPorMatricula = async (matricula) => {
  const token = sessionStorage.getItem('token');
  const response = await fetchWithLogging(`${AUTH_API_URL}/${matricula}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
};

export const crearVehiculo = async (vehiculo) => {
  const token = sessionStorage.getItem('token');
  const normalizedVehiculo = {
    ...vehiculo,
    fechaCompra: vehiculo.fechaCompra || null,
    foto: vehiculo.foto || null,
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
  const normalizedDatos = {
    ...datosActualizados,
    fechaCompra: datosActualizados.fechaCompra || null,
    foto: datosActualizados.foto || null,
  };
  const response = await fetchWithLogging(`${AUTH_API_URL}/${matricula}`, {
    method: 'PUT',
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
