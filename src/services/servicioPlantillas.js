import { fetchWithLogging } from './apiUtils';

const API_URL = 'https://gestion-vehiculos-backend.vercel.app/api/plantillas';

// Enums para plantillas
export const PLANTILLA_TRIGGER = {
  ANYO: 'ANYO',
  KM: 'KM',
};

export const PLANTILLA_FRECUENCIA = {
  MESES: 'MESES',
  KM: 'KM',
};

/**
 * Obtiene todas las plantillas disponibles
 * @returns {Promise<Array>} Array de plantillas
 */
export const obtenerPlantillas = async () => {
  try {
    const token = sessionStorage.getItem('token');
    const response = await fetchWithLogging(API_URL, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.json();
  } catch (error) {
    console.error('Error obteniendo plantillas:', error);
    throw error;
  }
};

/**
 * Obtiene una plantilla específica por ID
 * @param {string} id - ID de la plantilla
 * @returns {Promise<Object>} Objeto de plantilla
 */
export const obtenerPlantillaPorId = async (id) => {
  try {
    const response = await fetchWithLogging(`${API_URL}/${id}`);
    return response;
  } catch (error) {
    console.error(`Error obteniendo plantilla ${id}:`, error);
    throw error;
  }
};

/**
 * Obtiene las plantillas que aplican a un tipo de vehículo específico
 * @param {string} tipoVehiculo - Tipo de vehículo (ej: "Turismo", "Motocicleta")
 * @returns {Promise<Array>} Array de plantillas que aplican
 */
export const obtenerPlantillasParaTipo = async (tipoVehiculo) => {
  try {
    const plantillas = await obtenerPlantillas();

    // Filtrar plantillas que aplican a este tipo de vehículo
    return plantillas.filter(plantilla => {
      // Buscar si el tipoVehiculo coincide en la lista de vehiculos
      return plantilla.vehiculos && plantilla.vehiculos.some(v =>
        v.toLowerCase().includes(tipoVehiculo.toLowerCase())
      );
    });
  } catch (error) {
    console.error(`Error obteniendo plantillas para tipo ${tipoVehiculo}:`, error);
    throw error;
  }
};

/**
 * Obtiene las plantillas de ITV para un tipo de vehículo
 * @param {string} tipoVehiculo - Tipo de vehículo
 * @returns {Promise<Array>} Array de plantillas ITV
 */
export const obtenerPlantillasITV = async (tipoVehiculo) => {
  try {
    const plantillas = await obtenerPlantillasParaTipo(tipoVehiculo);

    // Filtrar solo las plantillas que son ITV
    return plantillas.filter(plantilla => plantilla.esItv === true);
  } catch (error) {
    console.error(`Error obteniendo plantillas ITV para ${tipoVehiculo}:`, error);
    throw error;
  }
};

/**
 * Calcula la próxima fecha de ITV basada en los rangos de la plantilla
 * @param {Object} plantilla - Objeto de plantilla ITV
 * @param {number} anyosAntiguedad - Años de antigüedad del vehículo
 * @param {number} kilometraje - Kilometraje actual del vehículo (opcional)
 * @returns {Date|null} Próxima fecha de ITV o null si no aplica
 */
export const calcularProximaITV = (plantilla, anyosAntiguedad, kilometraje = 0) => {
  try {
    if (!plantilla || !plantilla.rangos || plantilla.rangos.length === 0) {
      return null;
    }

    // Buscar el rango aplicable según años o kilometraje
    let rangoAplicable = null;

    if (plantilla.trigger === PLANTILLA_TRIGGER.ANYO) {
      // Buscar el rango que aplica según años de antigüedad
      rangoAplicable = plantilla.rangos
        .filter(r => r.desdeAnyo !== null && r.desdeAnyo !== undefined)
        .sort((a, b) => b.desdeAnyo - a.desdeAnyo)
        .find(r => anyosAntiguedad >= r.desdeAnyo);
    } else if (plantilla.trigger === PLANTILLA_TRIGGER.KM) {
      // Buscar el rango que aplica según kilometraje
      rangoAplicable = plantilla.rangos
        .filter(r => r.desdeKilometro !== null && r.desdeKilometro !== undefined)
        .sort((a, b) => b.desdeKilometro - a.desdeKilometro)
        .find(r => kilometraje >= r.desdeKilometro);
    }

    if (!rangoAplicable) {
      return null;
    }

    // Calcular próxima fecha según la frecuencia
    const hoy = new Date();
    let proximaFecha = new Date(hoy);

    if (plantilla.frecuencia === PLANTILLA_FRECUENCIA.MESES && rangoAplicable.frecuenciaMeses) {
      proximaFecha.setMonth(proximaFecha.getMonth() + rangoAplicable.frecuenciaMeses);
    } else if (plantilla.frecuencia === PLANTILLA_FRECUENCIA.KM && rangoAplicable.frecuenciaKilometros) {
      // Para frecuencia en km, estimamos días basados en consumo promedio
      // Asumimos consumo promedio de ~50 km/día
      const diasEstimados = Math.ceil(rangoAplicable.frecuenciaKilometros / 50);
      proximaFecha.setDate(proximaFecha.getDate() + diasEstimados);
    }

    // Aplicar margen de días si existe
    if (plantilla.margenDias) {
      proximaFecha.setDate(proximaFecha.getDate() + plantilla.margenDias);
    }

    return proximaFecha;
  } catch (error) {
    console.error('Error calculando próxima ITV:', error);
    return null;
  }
};

/**
 * Aplica las plantillas ITV a un vehículo recién creado
 * @param {Object} vehiculo - Datos del vehículo
 * @returns {Promise<Object>} Vehículo con próxima ITV calculada
 */
export const aplicarPlantillasAlVehiculo = async (vehiculo) => {
  try {
    // Obtener plantillas de ITV para el tipo de vehículo
    const plantillasItv = await obtenerPlantillasITV(vehiculo.tipo);

    if (plantillasItv.length === 0) {
      console.warn(`No hay plantillas ITV para tipo: ${vehiculo.tipo}`);
      return vehiculo;
    }

    // Usar la primera plantilla que aplique
    const plantilla = plantillasItv[0];

    // Calcular próxima ITV
    const proximaFecha = calcularProximaITV(
      plantilla,
      vehiculo.anyosAntiguedad || 0,
      vehiculo.kilometrosTotales || 0
    );

    if (proximaFecha) {
      // Formatear fecha como string YYYY-MM-DD
      const año = proximaFecha.getFullYear();
      const mes = String(proximaFecha.getMonth() + 1).padStart(2, '0');
      const dia = String(proximaFecha.getDate()).padStart(2, '0');
      vehiculo.proximaItv = `${año}-${mes}-${dia}`;
    }

    return vehiculo;
  } catch (error) {
    console.error('Error aplicando plantillas al vehículo:', error);
    // Retornar el vehículo sin cambios si hay error
    return vehiculo;
  }
};

/**
 * Obtiene las revisiones asociadas a una plantilla
 * @param {string} plantillaId - ID de la plantilla
 * @returns {Promise<Array>} Array de IDs de revisiones
 */
export const obtenerRevisionesDeplantilla = async (plantillaId) => {
  try {
    const plantilla = await obtenerPlantillaPorId(plantillaId);
    return plantilla.revisiones || [];
  } catch (error) {
    console.error(`Error obteniendo revisiones de plantilla ${plantillaId}:`, error);
    return [];
  }
};
/**
 * Crea una nueva plantilla
 * @param {Object} plantilla - Datos de la plantilla
 * @returns {Promise<Object>} Plantilla creada
 */
export const crearPlantilla = async (plantilla) => {
  try {
    const token = sessionStorage.getItem('token');
    const response = await fetchWithLogging(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(plantilla)
    });
    return response.json();
  } catch (error) {
    console.error('Error creando plantilla:', error);
    throw error;
  }
};

/**
 * Actualiza una plantilla existente
 * @param {string} id - ID de la plantilla
 * @param {Object} plantilla - Datos a actualizar
 * @returns {Promise<Object>} Plantilla actualizada
 */
export const actualizarPlantilla = async (id, plantilla) => {
  try {
    const token = sessionStorage.getItem('token');
    const response = await fetchWithLogging(`${API_URL}/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(plantilla)
    });
    return response.json();
  } catch (error) {
    console.error(`Error actualizando plantilla ${id}:`, error);
    throw error;
  }
};

/**
 * Elimina una plantilla
 * @param {string} id - ID de la plantilla
 * @returns {Promise<boolean>} True si se eliminó correctamente
 */
export const eliminarPlantilla = async (id) => {
  try {
    const token = sessionStorage.getItem('token');
    await fetchWithLogging(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return true;
  } catch (error) {
    console.error(`Error eliminando plantilla ${id}:`, error);
    throw error;
  }
};
