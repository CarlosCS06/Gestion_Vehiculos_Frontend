// Servicio mock de Averías

let averias = [
  {
    id: 'A001',
    descripcion: 'Fallo en el sistema de frenos',
    vehiculosAveriados: ['5678-DEF'],
    fechaReparacion: '',
    lugarReparacion: '',
  },
  {
    id: 'A002',
    descripcion: 'Motor recalentado, necesita revisión completa',
    vehiculosAveriados: ['7890-MNO'],
    fechaReparacion: '',
    lugarReparacion: '',
  },
];

let contadorId = 3;

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
};
