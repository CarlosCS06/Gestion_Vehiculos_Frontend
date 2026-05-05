import { createContext, useContext, useState, useEffect } from 'react';
import { iniciarSesion, verificarDniConductor, registrarConductor, preRegistrarUsuario as preRegistrar } from '../services/servicioAuth.js';

const ContextoAuth = createContext(null);

export const useAuth = () => {
  const contexto = useContext(ContextoAuth);
  if (!contexto) {
    throw new Error('useAuth debe usarse dentro de un ProveedorAuth');
  }
  return contexto;
};

export const ProveedorAuth = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  // Recuperar sesión del localStorage al cargar
  useEffect(() => {
    const usuarioGuardado = sessionStorage.getItem('usuario_sesion');
    if (usuarioGuardado) {
      try {
        setUsuario(JSON.parse(usuarioGuardado));
      } catch {
        sessionStorage.removeItem('usuario_sesion');
      }
    }
    setCargando(false);
  }, []);

  const login = async (dni, contrasena) => {
    const usuarioAuth = await iniciarSesion(dni, contrasena);
    setUsuario(usuarioAuth);
    sessionStorage.setItem('usuario_sesion', JSON.stringify(usuarioAuth));
    return usuarioAuth;
  };

  const logout = () => {
    setUsuario(null);
    sessionStorage.removeItem('usuario_sesion');
    sessionStorage.removeItem('token');
  };


  const verificarDni = async (dni) => {
    return await verificarDniConductor(dni);
  };

  const registro = async (dni, contrasena, email) => {
    const nuevoUsuario = await registrarConductor(dni, contrasena, email);
    setUsuario(nuevoUsuario);
    sessionStorage.setItem('usuario_sesion', JSON.stringify(nuevoUsuario));
    return nuevoUsuario;
  };

  const preRegistrarUsuario = async (conductor) => {
    return await preRegistrar(conductor);
  };

  const estaAutenticado = !!usuario;
  const esAdmin = usuario?.rol === 'admin';

  const actualizarDatosUsuario = (nuevosDatos) => {
    const usuarioActualizado = { ...usuario, ...nuevosDatos };
    setUsuario(usuarioActualizado);
    sessionStorage.setItem('usuario_sesion', JSON.stringify(usuarioActualizado));
  };

  const valor = {
    usuario,
    cargando,
    estaAutenticado,
    esAdmin,
    login,
    logout,
    verificarDni,
    registro,
    preRegistrarUsuario,
    actualizarDatosUsuario,
  };

  return (
    <ContextoAuth.Provider value={valor}>
      {children}
    </ContextoAuth.Provider>
  );
};

export default ContextoAuth;
