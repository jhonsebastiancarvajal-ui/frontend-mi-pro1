/**
 * ============================================================================
 * CONFIGURACIÓN CENTRAL DE LA API (CONEXIÓN FRONTEND <-> BACKEND)
 * ============================================================================
 * 
 * INSTRUCCIONES PARA EL ENCARGADO DEL DESPLIEGUE:
 * 1. Para cambiar la URL del backend, NO edites este archivo.
 * 2. Abre el archivo `.env` que está en la raíz del proyecto.
 * 3. Modifica la variable `VITE_API_URL` con la URL del backend desplegado.
 *    Ejemplo: VITE_API_URL=https://api.midominio.com/api
 * 
 * Todo el frontend tomará automáticamente esa URL desde aquí.
 */

// Lee la URL de la API desde el archivo .env, o usa localhost por defecto si no existe.
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Configuración genérica para las peticiones.
 * Aquí puedes añadir el Token de autenticación en los Headers si el backend lo requiere.
 */
const getHeaders = () => {
  return {
    'Content-Type': 'application/json',
    // Descomentar y ajustar la siguiente línea cuando se implemente login/autenticación:
    // 'Authorization': `Bearer ${localStorage.getItem('token')}` 
  };
};

// ============================================================================
// EJEMPLOS DE LLAMADAS AL BACKEND QUE EL ENCARGADO PUEDE USAR:
// ============================================================================

/**
 * Obtener los detalles de un evento específico.
 */
export const fetchEventoPorId = async (eventoId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/eventos/${eventoId}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    
    if (!response.ok) throw new Error('Error al obtener el evento desde el backend');
    
    return await response.json(); // Retorna los datos reales del backend
  } catch (error) {
    console.error("Error en fetchEventoPorId:", error);
    throw error;
  }
};

/**
 * Marcar una subtarea como completada o pendiente.
 */
export const actualizarEstadoSubtarea = async (subtareaId, nuevoEstado) => {
  try {
    const response = await fetch(`${API_BASE_URL}/tareas/${subtareaId}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ status: nuevoEstado })
    });

    if (!response.ok) throw new Error('Error al actualizar el estado de la subtarea');

    return await response.json();
  } catch (error) {
    console.error("Error en actualizarEstadoSubtarea:", error);
    throw error;
  }
};

/**
 * Crear un nuevo evento en la base de datos.
 */
export const crearNuevoEvento = async (datosEvento) => {
  try {
    const response = await fetch(`${API_BASE_URL}/eventos`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(datosEvento)
    });

    if (!response.ok) throw new Error('Error al crear el evento en el backend');

    return await response.json();
  } catch (error) {
    console.error("Error en crearNuevoEvento:", error);
    throw error;
  }
};

// ... El encargado del backend/frontend puede seguir añadiendo las demás rutas aquí abajo ...
