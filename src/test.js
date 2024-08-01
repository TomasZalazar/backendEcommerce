import axios from 'axios';
import cookie from 'cookie';

// Datos de usuario para pruebas
const userData = {
  email: 'tomaszalazar@gmail.com', // Reemplaza con un email válido
  password: 'tomaszalazar'         // Reemplaza con una contraseña válida
};

// Endpoint del servidor
const LOGIN_URL = 'http://localhost:4000/api/auth/login';

// Función para hacer login y obtener el token
async function loginUser() {
  try {
    const response = await axios.post(LOGIN_URL, userData, { withCredentials: true });

    if (response.status === 200) {
      console.log('Login exitoso. Token recibido en cookie.');
      return true; // Solo necesitamos saber si el login fue exitoso
    } else {
      console.error('Error durante el login. Código de estado:', response.status);
      console.error('Mensaje:', response.data); // Mostrar mensaje del servidor
      return null;
    }
  } catch (error) {
    if (error.response) {
      console.error('Error durante el login. Código de estado:', error.response.status);
      console.error('Mensaje:', error.response.data);
    } else {
      console.error('Error en la solicitud de login:', error.message);
    }
    return null;
  }
}

// Función para realizar una solicitud autenticada
async function performAuthenticatedRequest() {
  try {
    const response = await axios.get('http://localhost:4000/api/protected/protected-resource', {
      withCredentials: true // Esto es esencial para enviar cookies en la solicitud
    });
    console.log('Recurso protegido:', response.data);
  } catch (error) {
    if (error.response) {
      console.error('Error al acceder al recurso protegido. Código de estado:', error.response.status);
      console.error('Mensaje:', error.response.data);
    } else {
      console.error('Error en la solicitud de recurso protegido:', error.message);
    }
  }
}
// Función principal para ejecutar el test
async function runTest() {
  console.log('Iniciando prueba de autenticación...');

  const loginSuccess = await loginUser();

  if (loginSuccess) {
    console.log('Login exitoso');
    await performAuthenticatedRequest();
  } else {
    console.error('No se pudo obtener el token.');
  }
}

runTest();
