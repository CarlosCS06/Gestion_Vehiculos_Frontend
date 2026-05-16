import { Badge } from '@fluentui/react-components';
import { ESTADO_VEHICULO } from '../../models/Vehiculo.js';

const mapaEstado = {
  [ESTADO_VEHICULO.DISPONIBLE]: { color: 'success', texto: 'Disponible' },
  [ESTADO_VEHICULO.EN_TRAYECTO]: { color: 'warning', texto: 'En trayecto' },
  [ESTADO_VEHICULO.AVERIADO]: { color: 'danger', texto: 'Averiado' },
};

const BadgeEstado = ({ estado }) => {
  // Aseguramos que el estado sea comparable (mayúsculas y no nulo)
  const estadoNormalizado = (estado || '').toUpperCase();
  const config = mapaEstado[estadoNormalizado] || mapaEstado[ESTADO_VEHICULO.DISPONIBLE];

  return (
    <Badge
      appearance="filled"
      color={config.color}
      style={{
        padding: '4px 12px',
        fontSize: '12px',
        fontWeight: 600,
      }}
    >
      {config.texto}
    </Badge>
  );
};

export default BadgeEstado;
