const API_CARBURANTES = 'https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes';

const obtenerJsonCarburantes = async (endpoint) => {
  const response = await fetch(`${API_CARBURANTES}/${endpoint}`);

  if (!response.ok) {
    throw new Error('Error al consultar la API de carburantes');
  }

  return response.json();
};

export const obtenerComunidadesAutonomas = async () => {
  return obtenerJsonCarburantes('Listados/ComunidadesAutonomas/');
};

export const obtenerProvinciasPorComunidad = async (idComunidad) => {
  return obtenerJsonCarburantes(`Listados/ProvinciasPorComunidad/${idComunidad}`);
};

export const obtenerMunicipiosPorProvincia = async (idProvincia) => {
  return obtenerJsonCarburantes(`Listados/MunicipiosPorProvincia/${idProvincia}`);
};

export const obtenerProductosPetroliferos = async () => {
  return obtenerJsonCarburantes('Listados/ProductosPetroliferos/');
};

export const obtenerEstacionesPorFiltros = async ({
  idComunidad,
  idProvincia,
  idMunicipio,
  idProducto,
}) => {
  if (idMunicipio && idProducto) {
    return obtenerJsonCarburantes(
      `EstacionesTerrestres/FiltroMunicipioProducto/${idMunicipio}/${idProducto}`
    );
  }

  if (idProvincia && idProducto) {
    return obtenerJsonCarburantes(
      `EstacionesTerrestres/FiltroProvinciaProducto/${idProvincia}/${idProducto}`
    );
  }

  if (idComunidad && idProducto) {
    return obtenerJsonCarburantes(
      `EstacionesTerrestres/FiltroCCAAProducto/${idComunidad}/${idProducto}`
    );
  }

  throw new Error('Debes seleccionar al menos Comunidad Autónoma y carburante');
};

export const obtenerPrecioMedio = (respuestaApi, nombreProducto) => {
  const estaciones = respuestaApi?.ListaEESSPrecio || [];

  const clavesPrecio = [
    nombreProducto,
    `Precio ${nombreProducto}`,
  ].map((c) => c.toLowerCase());

  const precios = estaciones
    .map((estacion) => {
      const claveEncontrada = Object.keys(estacion).find((clave) =>
        clavesPrecio.includes(clave.toLowerCase())
      );

      if (!claveEncontrada) return null;

      return Number(String(estacion[claveEncontrada]).replace(',', '.'));
    })
    .filter((precio) => Number.isFinite(precio) && precio > 0);

  if (precios.length === 0) return null;

  return precios.reduce((total, precio) => total + precio, 0) / precios.length;
};