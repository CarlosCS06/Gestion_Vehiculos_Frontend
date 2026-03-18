// Servicio mock de Conductores

let conductores = [
  {
    dni: '12345678A',
    nombre: 'Carlos',
    apellidos: 'García López',
    telefono: '612345678',
    direccion: 'Calle Mayor 10, Madrid',
    trayectos: ['T001', 'T002'],
  },
  {
    dni: '87654321B',
    nombre: 'María',
    apellidos: 'Fernández Ruiz',
    telefono: '698765432',
    direccion: 'Avenida del Sol 5, Barcelona',
    trayectos: ['T003', 'T005'],
  },
  {
    dni: '11223344C',
    nombre: 'Pedro',
    apellidos: 'Martínez Sánchez',
    telefono: '655112233',
    direccion: 'Plaza España 3, Valencia',
    trayectos: ['T004'],
  },
];

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
  return { ...conductor };
};

export const actualizarConductor = async (dni, datosActualizados) => {
  await simularRetardo();
  const indice = conductores.findIndex((c) => c.dni === dni);
  if (indice === -1) throw new Error('Conductor no encontrado');
  conductores[indice] = { ...conductores[indice], ...datosActualizados };
  return { ...conductores[indice] };
};

export const eliminarConductor = async (dni) => {
  await simularRetardo();
  conductores = conductores.filter((c) => c.dni !== dni);
  return true;
};
