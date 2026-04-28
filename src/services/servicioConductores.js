import { fetchWithLogging } from './apiUtils';

const AUTH_API_URL = 'https://gestion-vehiculos-backend.vercel.app/api/conductores';

const mapearConductor = (data) => {
  let fechaFormat = '';
  if (data.fechaNacimiento || data.fecha_nacimiento) {
    const d = new Date(data.fechaNacimiento || data.fecha_nacimiento);
    if (!isNaN(d.getTime())) {
      fechaFormat = d.toISOString().split('T')[0];
    }
  }

  return {
    ...data,
    fechaNacimiento: fechaFormat,
    // Si viene imageId pero no el objeto image completo, lo preparamos para evitar errores en UI
    image: data.image || (data.imageId ? { id: data.imageId } : null),
    trayectos: data.trayectos || data.infoEspecificaTrayectos || [],
  };
};

const normalizarConductor = (c) => {
  let fechaIso = undefined;
  if (c.fechaNacimiento) {
    const d = new Date(c.fechaNacimiento);
    if (!isNaN(d.getTime())) {
      fechaIso = d.toISOString();
    }
  }

  const normalized = {
    dni: c.dni,
    nombre: c.nombre,
    apellidos: c.apellidos,
    telefono: c.telefono,
    direccion: c.direccion,
    fechaNacimiento: fechaIso,
    vehiculo: Array.isArray(c.vehiculo) 
      ? c.vehiculo.map(v => typeof v === 'object' ? (v.matricula || v.id) : v).filter(Boolean)
      : [c.vehiculo].map(v => typeof v === 'object' ? (v.matricula || v.id) : v).filter(Boolean),
  };

  // Si tenemos imageId (de una subida previa por URL o similar), lo incluimos
  // Y NO incluimos el objeto image para evitar conflictos en el backend (Prisma)
  if (c.imageId) {
    normalized.imageId = c.imageId;
  } else if (c.image && !(c.image instanceof File)) {
    // Solo si no hay imageId, intentamos mandar el objeto (compatibilidad)
    normalized.image = {
      name: c.image.name || c.image.nombre || `conductor_${c.dni}`,
      url: c.image.url || ''
    };
  }

  return normalized;
};

export const obtenerConductores = async () => {
  const token = sessionStorage.getItem('token');
  const response = await fetchWithLogging(AUTH_API_URL, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const datos = await response.json();
  return Array.isArray(datos) ? datos.map(mapearConductor) : (typeof datos === 'object' ? Object.values(datos).map(mapearConductor) : []);
};

export const obtenerConductorPorDni = async (dni) => {
  try {
    const token = sessionStorage.getItem('token');
    const response = await fetchWithLogging(`${AUTH_API_URL}/${dni}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();
    return data ? mapearConductor(data) : null;
  } catch (error) {
    if (error.status === 404) return null;
    throw error;
  }
};

/**
 * Prepara los datos para ser enviados como FormData (multipart/form-data)
 */
const prepararFormData = (conductor) => {
  const formData = new FormData();
  formData.append('dni', conductor.dni);
  formData.append('nombre', conductor.nombre);
  formData.append('apellidos', conductor.apellidos);
  if (conductor.telefono) formData.append('telefono', conductor.telefono);
  if (conductor.direccion) formData.append('direccion', conductor.direccion);
  if (conductor.fechaNacimiento) {
    formData.append('fechaNacimiento', new Date(conductor.fechaNacimiento).toISOString());
  }

  if (Array.isArray(conductor.vehiculo)) {
    conductor.vehiculo.forEach(v => formData.append('vehiculo', v));
  } else if (conductor.vehiculo) {
    formData.append('vehiculo', conductor.vehiculo);
  }

  if (conductor.image instanceof File) {
    formData.append('image', conductor.image);
  }

  if (conductor.imageId) {
    formData.append('imageId', conductor.imageId);
  }

  return formData;
};

export const crearConductor = async (conductor) => {
  const token = sessionStorage.getItem('token');
  const esMultipart = conductor.image instanceof File;

  const config = {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: esMultipart ? prepararFormData(conductor) : JSON.stringify(normalizarConductor(conductor)),
  };

  if (!esMultipart) {
    config.headers['Content-Type'] = 'application/json';
  }

  const response = await fetchWithLogging(AUTH_API_URL, config);
  return response.json();
};

export const actualizarConductor = async (dni, datosActualizados) => {
  const token = sessionStorage.getItem('token');
  const esMultipart = datosActualizados.image instanceof File;

  const config = {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: esMultipart ? prepararFormData(datosActualizados) : JSON.stringify(normalizarConductor(datosActualizados)),
  };

  if (!esMultipart) {
    config.headers['Content-Type'] = 'application/json';
  }
  console.log(datosActualizados);
  const response = await fetchWithLogging(`${AUTH_API_URL}/${dni}`, config);
  return response.json();
};

export const eliminarConductor = async (dni) => {
  const token = sessionStorage.getItem('token');
  const response = await fetchWithLogging(`${AUTH_API_URL}/${dni}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
  });
  return response.json();
};
/*  
const CONDUCTORES_INICIALES = [
  {
    dni: '12345678A',
    foto: '/fotoCarlos.png',
    nombre: 'Carlos',
    apellidos: 'García López',
    telefono: '612345678',
    direccion: 'Calle Mayor 10, Madrid',
    fechaNacimiento: '1990-12-10',
    trayectos: ['T001', 'T002'],
  },
  {
    dni: '87654321B',
    foto: '/fotoMaria.png',
    nombre: 'María',
    apellidos: 'Fernández Ruiz',
    telefono: '698765432',
    direccion: 'Avenida del Sol 5, Barcelona',
    fechaNacimiento: '1985-05-05',
    trayectos: ['T003', 'T005'],
  },
  {
    dni: '11223344C',
    foto: '/fotoPedro.png',
    nombre: 'Pedro',
    apellidos: 'Martínez Sánchez',
    telefono: '655112233',
    direccion: 'Plaza España 3, Valencia',
    fechaNacimiento: '1988-01-01',
    trayectos: ['T004'],
  },
];

const cargarConductores = () => {
  const guardados = localStorage.getItem('conductores_mock');
  return guardados ? JSON.parse(guardados) : CONDUCTORES_INICIALES;
};

let conductores = cargarConductores();

const guardarConductores = () => {
  localStorage.setItem('conductores_mock', JSON.stringify(conductores));
};

const simularRetardo = () => new Promise((res) => setTimeout(res, 200));

export const obtenerConductores = async () => {
  await simularRetardo();
  return [...conductores];
};

export const obtenerConductorPorDni = async (dni) => {
  await simularRetardo();
  return conductores.find((c) => c.dni === dni) || null;
};

export const crearConductor = async (conductor) => {
  await simularRetardo();
  conductores.push({ ...conductor, trayectos: conductor.trayectos || [] });
  guardarConductores();
  return { ...conductor };
};

export const actualizarConductor = async (dni, datosActualizados) => {
  await simularRetardo();
  const indice = conductores.findIndex((c) => c.dni === dni);
  if (indice === -1) throw new Error('Conductor no encontrado');
  conductores[indice] = { ...conductores[indice], ...datosActualizados };
  guardarConductores();
  return { ...conductores[indice] };
};

export const eliminarConductor = async (dni) => {
  await simularRetardo();
  conductores = conductores.filter((c) => c.dni !== dni);
  guardarConductores();
  return true;
};
*/
