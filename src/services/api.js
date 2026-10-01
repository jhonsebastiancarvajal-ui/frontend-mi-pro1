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

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'; // Django typically runs on 8000

// ============================================================================
// SISTEMA DE CACHÉ EN MEMORIA PARA NAVEGACIÓN INSTANTÁNEA
// ============================================================================
const apiCache = new Map();

export const clearApiCache = () => {
  apiCache.clear();
};

/**
 * Configuración genérica para las peticiones.
 * Aquí puedes añadir el Token de autenticación en los Headers si el backend lo requiere.
 */
const getHeaders = () => {
  const headers = {
    'Content-Type': 'application/json',
  };
  const token = localStorage.getItem('token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

// ============================================================================
// EJEMPLOS DE LLAMADAS AL BACKEND QUE EL ENCARGADO PUEDE USAR:
// ============================================================================

/**
 * Obtener los detalles de un evento específico.
 */
export const fetchEventoPorId = async (eventoId) => {
  const cacheKey = `evento_${eventoId}`;
  if (apiCache.has(cacheKey)) return apiCache.get(cacheKey);

  try {
    const response = await fetch(`${API_BASE_URL}/activities/${eventoId}/`, {
      method: 'GET',
      headers: getHeaders(),
    });
    
    if (!response.ok) throw new Error('Error al obtener el evento desde el backend');
    
    const data = await response.json();
    apiCache.set(cacheKey, data);
    return data;
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
    const response = await fetch(`${API_BASE_URL}/subtasks/${subtareaId}/`, {
      method: 'PATCH', // Usually PATCH is better for partial update, or PUT if expected by backend
      headers: getHeaders(),
      body: JSON.stringify({ status: nuevoEstado })
    });

    if (!response.ok) throw new Error('Error al actualizar el estado de la subtarea');

    clearApiCache(); // Invalida caché al mutar datos
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
    const response = await fetch(`${API_BASE_URL}/activities/`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(datosEvento)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.detail || errorData.non_field_errors || JSON.stringify(errorData) || 'Error al crear el evento en el backend';
      throw new Error(`Error: ${errorMessage}`);
    }

    clearApiCache(); // Invalida caché al mutar datos
    return await response.json();
  } catch (error) {
    console.error("Error en crearNuevoEvento:", error);
    throw error;
  }
};

/**
 * Crear una nueva subtarea asociada a un evento.
 */
export const crearNuevaSubtarea = async (eventoId, datosSubtarea) => {
  try {
    const response = await fetch(`${API_BASE_URL}/activities/${eventoId}/subtasks/`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(datosSubtarea)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.detail || errorData.non_field_errors || JSON.stringify(errorData) || 'Error al crear la subtarea en el backend';
      throw new Error(`Error en subtarea: ${errorMessage}`);
    }

    clearApiCache(); // Invalida caché al mutar datos
    return await response.json();
  } catch (error) {
    console.error("Error en crearNuevaSubtarea:", error);
    throw error;
  }
};

// ... El encargado del backend/frontend puede seguir añadiendo las demás rutas aquí abajo ...

export const fetchTareasHoy = async () => {
  const cacheKey = 'tareas_hoy';
  if (apiCache.has(cacheKey)) return apiCache.get(cacheKey);

  try {
    const response = await fetch(`${API_BASE_URL}/today/`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) throw new Error('Error al obtener las tareas de hoy');

    const data = await response.json();
    apiCache.set(cacheKey, data);
    return data;
  } catch (error) {
    console.error("Error en fetchTareasHoy:", error);
    throw error;
  }
};

export const fetchAllEventos = async () => {
  const cacheKey = 'all_eventos';
  if (apiCache.has(cacheKey)) return apiCache.get(cacheKey);

  try {
    const response = await fetch(`${API_BASE_URL}/activities/`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) throw new Error('Error al obtener los eventos');

    const data = await response.json();
    apiCache.set(cacheKey, data);
    return data;
  } catch (error) {
    console.error("Error en fetchAllEventos:", error);
    throw error;
  }
};

export const actualizarEvento = async (eventoId, datosEvento) => {
  try {
    const response = await fetch(`${API_BASE_URL}/activities/${eventoId}/`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(datosEvento)
    });

    if (!response.ok) throw new Error('Error al actualizar el evento');

    clearApiCache(); // Invalida caché al mutar datos
    return await response.json();
  } catch (error) {
    console.error("Error en actualizarEvento:", error);
    throw error;
  }
};

export const eliminarEvento = async (eventoId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/activities/${eventoId}/`, {
      method: 'DELETE',
      headers: getHeaders(),
    });

    if (!response.ok) throw new Error('Error al eliminar el evento');

    clearApiCache(); // Invalida caché al mutar datos
    return true; // DELETE no suele retornar JSON
  } catch (error) {
    console.error("Error en eliminarEvento:", error);
    throw error;
  }
};

export const actualizarDatosSubtarea = async (subtareaId, datosSubtarea) => {
  try {
    const response = await fetch(`${API_BASE_URL}/subtasks/${subtareaId}/`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(datosSubtarea)
    });

    if (!response.ok) throw new Error('Error al actualizar la subtarea');

    clearApiCache(); // Invalida caché al mutar datos
    return await response.json();
  } catch (error) {
    console.error("Error en actualizarDatosSubtarea:", error);
    throw error;
  }
};

export const eliminarSubtarea = async (subtareaId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/subtasks/${subtareaId}/`, {
      method: 'DELETE',
      headers: getHeaders(),
    });

    if (!response.ok) throw new Error('Error al eliminar la subtarea');

    clearApiCache(); // Invalida caché al mutar datos
    return true;
  } catch (error) {
    console.error("Error en eliminarSubtarea:", error);
    throw error;
  }
};
