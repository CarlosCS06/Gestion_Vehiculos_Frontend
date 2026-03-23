// Servicio mock de Averías

const AUTH_API_URL = 'https://gestion-vehiculos-backend.vercel.app/api/averias';

export const obtenerAverias = async () => {
  const response = await fetch(AUTH_API_URL);
  if (!response.ok) {
    throw new Error('Error al obtener las averías');
  }
  return response.json();
};

export const obtenerAveriaPorId = async (id) => {
  const response = await fetch(`${AUTH_API_URL}/${id}`);
  if (!response.ok) {
    throw new Error('Error al obtener la avería');
  }
  return response.json();
};

export const crearAveria = async (averia) => {
  const response = await fetch(AUTH_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(averia),
  });
  if (!response.ok) {
    throw new Error('Error al crear la avería');
  }
  return response.json();
};

export const actualizarAveria = async (id, datosActualizados) => {
  const response = await fetch(`${AUTH_API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datosActualizados),
  });
  if (!response.ok) {
    throw new Error('Error al actualizar la avería');
  }
  return response.json();
};

export const eliminarAveria = async (id) => {
  const response = await fetch(`${AUTH_API_URL}/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Error al eliminar la avería');
  }
  return response.json();
};
/*
let averias = [
  {
    id: 'A001',
    descripcion: 'Fallo en el sistema de frenos',
    vehiculosAveriados: ['5678-DEF'],
    fechaAveria: '2026-02-19',
    fechaComienzoReparacion: '2026-02-20',
    fechaFinReparacion: '2026-02-20',
    lugarReparacion: 'Taller Hermanos Ruiz, Sevilla',
    enReparacion: false,
    costeReparacion: '1000',
  },
  {
    id: 'A002',
    descripcion: 'Motor recalentado, necesita revisión completa',
    vehiculosAveriados: ['7890-MNO'],
    fechaAveria: '2026-02-18',
    fechaComienzoReparacion: '2026-02-20',
    fechaFinReparacion: '',
    lugarReparacion: 'Taller de Pedro, Madrid',
    enReparacion: true,
    costeReparacion: '2000',
  },
  {
    id: 'A003',
    descripcion: 'Parabrisas agrietado',
    vehiculosAveriados: ['1234-ABC'],
    fechaAveria: '2026-02-20',
    fechaComienzoReparacion: '',
    fechaFinReparacion: '',
    lugarReparacion: '',
    enReparacion: false,
    costeReparacion: '',
  },
];

let contadorId = 4;

const simularRetardo = () => new Promise((res) => setTimeout(res, 200));

export const obtenerAverias = async () => {
  await simularRetardo();
  return [...averias];
};

export const obtenerAveriaPorId = async (id) => {
  await simularRetardo();
  return averias.find((a) => a.id === id) || null;
};

export const crearAveria = async (averia) => {
  await simularRetardo();
  const nueva = { ...averia, id: `A${String(contadorId++).padStart(3, '0')}` };
  averias.push(nueva);
  return { ...nueva };
};

export const actualizarAveria = async (id, datosActualizados) => {
  await simularRetardo();
  const indice = averias.findIndex((a) => a.id === id);
  if (indice === -1) throw new Error('Avería no encontrada');
  averias[indice] = { ...averias[indice], ...datosActualizados };
  return { ...averias[indice] };
};

export const eliminarAveria = async (id) => {
  await simularRetardo();
  averias = averias.filter((a) => a.id !== id);
  return true;
};*/
