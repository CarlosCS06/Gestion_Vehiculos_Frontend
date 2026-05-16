import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogSurface,
  DialogTitle,
  DialogBody,
  DialogContent,
  DialogActions,
  Button,
  Input,
  Field,
  Select,
  Switch,
  makeStyles,
  tokens,
  Divider,
  Subtitle2,
  Tooltip,
} from '@fluentui/react-components';
import { 
  Add20Regular, 
  Delete20Regular, 
  Wrench20Regular 
} from '@fluentui/react-icons';
import { 
  PLANTILLA_TRIGGER, 
  PLANTILLA_FRECUENCIA, 
  crearPlantillaVacia 
} from '../../models/Plantilla.js';

const useEstilos = makeStyles({
  formulario: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalM,
  },
  fila: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: tokens.spacingHorizontalM,
  },
  seccionRangos: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
    marginTop: tokens.spacingVerticalM,
    padding: tokens.spacingHorizontalM,
    backgroundColor: tokens.colorNeutralBackground2,
    borderRadius: tokens.borderRadiusMedium,
  },
  rangoItem: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr auto',
    gap: tokens.spacingHorizontalS,
    alignItems: 'end',
    padding: tokens.spacingVerticalS,
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
  },
});

const ModalGestionPlantilla = ({ abierto, alCerrar, alGuardar, plantillaEditar = null }) => {
  const estilos = useEstilos();
  const [plantilla, setPlantilla] = useState(crearPlantillaVacia());
  const [procesando, setProcesando] = useState(false);

  useEffect(() => {
    if (plantillaEditar) {
      setPlantilla({ ...plantillaEditar });
    } else {
      setPlantilla(crearPlantillaVacia());
    }
  }, [plantillaEditar, abierto]);

  const manejarCambio = (campo, valor) => {
    setPlantilla(prev => ({ ...prev, [campo]: valor }));
  };

  const manejarCambioRango = (index, campo, valor) => {
    const nuevosRangos = [...plantilla.rangos];
    nuevosRangos[index] = { ...nuevosRangos[index], [campo]: valor };
    setPlantilla(prev => ({ ...prev, rangos: nuevosRangos }));
  };

  const añadirRango = () => {
    setPlantilla(prev => ({
      ...prev,
      rangos: [...prev.rangos, { desdeAnyo: 0, desdeKilometro: 0, frecuenciaMeses: 0, frecuenciaKilometros: 0 }]
    }));
  };

  const eliminarRango = (index) => {
    if (plantilla.rangos.length <= 1) return;
    setPlantilla(prev => ({
      ...prev,
      rangos: prev.rangos.filter((_, i) => i !== index)
    }));
  };

  const manejarGuardar = async () => {
    setProcesando(true);
    try {
      await alGuardar(plantilla);
      alCerrar();
    } catch (err) {
      console.error("Error al guardar plantilla:", err);
    } finally {
      setProcesando(false);
    }
  };

  return (
    <Dialog open={abierto} onOpenChange={(_, d) => !d.open && alCerrar()}>
      <DialogSurface style={{ maxWidth: '650px' }}>
        <DialogBody>
          <DialogTitle>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Wrench20Regular />
              {plantillaEditar ? 'Editar Plantilla de Mantenimiento' : 'Nueva Plantilla de Mantenimiento'}
            </div>
          </DialogTitle>
          <DialogContent>
            <div className={estilos.formulario}>
              <div className={estilos.fila}>
                <Field label="Nombre de la plantilla" required>
                  <Input 
                    value={plantilla.nombre || ''} 
                    onChange={(_, d) => manejarCambio('nombre', d.value)} 
                    placeholder="Ej: Mantenimiento Estándar"
                  />
                </Field>
                <div style={{ display: 'flex', alignItems: 'center', paddingTop: '24px' }}>
                  <Switch 
                    label="Es ITV oficial" 
                    checked={plantilla.esItv} 
                    onChange={(_, d) => manejarCambio('esItv', d.checked)} 
                  />
                </div>
              </div>

              <div className={estilos.fila}>
                <Field label="Disparador (Trigger)">
                  <Select 
                    value={plantilla.trigger} 
                    onChange={(_, d) => manejarCambio('trigger', d.value)}
                  >
                    <option value={PLANTILLA_TRIGGER.ANYO}>Años de antigüedad</option>
                    <option value={PLANTILLA_TRIGGER.KM}>Kilómetros totales</option>
                  </Select>
                </Field>
                <Field label="Frecuencia">
                  <Select 
                    value={plantilla.frecuencia} 
                    onChange={(_, d) => manejarCambio('frecuencia', d.value)}
                  >
                    <option value={PLANTILLA_FRECUENCIA.MESES}>Cada X Meses</option>
                    <option value={PLANTILLA_FRECUENCIA.KM}>Cada X Kilómetros</option>
                  </Select>
                </Field>
              </div>

              <Field label="Margen de cortesía (días)" hint="Días adicionales antes de marcar como vencida">
                <Input 
                  type="number" 
                  value={String(plantilla.margenDias || 0)} 
                  onChange={(_, d) => manejarCambio('margenDias', Number(d.value))} 
                />
              </Field>

              <div className={estilos.seccionRangos}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Subtitle2>Rangos de Aplicación</Subtitle2>
                  <Button 
                    size="small" 
                    icon={<Add20Regular />} 
                    onClick={añadirRango}
                  >
                    Añadir Rango
                  </Button>
                </div>
                <Divider />
                
                {plantilla.rangos.map((rango, index) => (
                  <div key={index} className={estilos.rangoItem}>
                    <Field label={plantilla.trigger === PLANTILLA_TRIGGER.ANYO ? "Desde Año" : "Desde Km"}>
                      <Input 
                        type="number" 
                        value={String(plantilla.trigger === PLANTILLA_TRIGGER.ANYO ? rango.desdeAnyo : rango.desdeKilometro)} 
                        onChange={(_, d) => manejarCambioRango(index, plantilla.trigger === PLANTILLA_TRIGGER.ANYO ? 'desdeAnyo' : 'desdeKilometro', Number(d.value))}
                      />
                    </Field>
                    <Field label={plantilla.frecuencia === PLANTILLA_FRECUENCIA.MESES ? "Cada (Meses)" : "Cada (Km)"}>
                      <Input 
                        type="number" 
                        value={String(plantilla.frecuencia === PLANTILLA_FRECUENCIA.MESES ? rango.frecuenciaMeses : rango.frecuenciaKilometros)} 
                        onChange={(_, d) => manejarCambioRango(index, plantilla.frecuencia === PLANTILLA_FRECUENCIA.MESES ? 'frecuenciaMeses' : 'frecuenciaKilometros', Number(d.value))}
                      />
                    </Field>
                    <Tooltip content="Eliminar rango" relationship="label">
                      <Button 
                        icon={<Delete20Regular />} 
                        appearance="subtle" 
                        onClick={() => eliminarRango(index)} 
                      />
                    </Tooltip>
                  </div>
                ))}
              </div>
            </div>
          </DialogContent>
          <DialogActions>
            <Button appearance="secondary" onClick={alCerrar}>Cancelar</Button>
            <Button appearance="primary" onClick={manejarGuardar} disabled={procesando}>
              {plantillaEditar ? 'Guardar Cambios' : 'Crear Plantilla'}
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};

export default ModalGestionPlantilla;
