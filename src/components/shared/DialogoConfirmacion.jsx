import {
  Dialog,
  DialogSurface,
  DialogTitle,
  DialogBody,
  DialogActions,
  DialogContent,
  Button,
} from '@fluentui/react-components';
import { Warning24Regular } from '@fluentui/react-icons';

const DialogoConfirmacion = ({ abierto, titulo, mensaje, onConfirmar, onCancelar }) => {
  return (
    <Dialog open={abierto} onOpenChange={(_, datos) => { if (!datos.open) onCancelar(); }}>
      <DialogSurface>
        <DialogBody>
          <DialogTitle
            action={null}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Warning24Regular style={{ color: '#d13438' }} />
            {titulo || '¿Estás seguro?'}
          </DialogTitle>
          <DialogContent>
            {mensaje || '¿Deseas continuar con esta acción? No se puede deshacer.'}
          </DialogContent>
          <DialogActions>
            <Button appearance="secondary" onClick={onCancelar}>
              Cancelar
            </Button>
            <Button appearance="primary" onClick={onConfirmar} style={{ backgroundColor: '#d13438' }}>
              Eliminar
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};

export default DialogoConfirmacion;
