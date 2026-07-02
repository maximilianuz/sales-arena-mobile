import { Platform } from 'react-native';
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyDi9uc_gDsi5krnR44YaZiFWcz9fJYeBPA",
  authDomain: "sales-arena-94086.firebaseapp.com",
  projectId: "sales-arena-94086",
  storageBucket: "sales-arena-94086.firebasestorage.app",
  messagingSenderId: "423888171348",
  appId: "1:423888171348:web:4508726cc1406edb8258c1",
  measurementId: "G-5T2XGLLBEB"
};

// Mismo proyecto Firebase que la web (sales-arena-94086) → web y móvil comparten
// salas, usuarios y suscripciones. NO cambiar sin coordinar ambos repos.
const app = initializeApp(firebaseConfig);

export const db = getDatabase(app);

// Auth con persistencia según plataforma.
// - Nativo: hay que pasar getReactNativePersistence(AsyncStorage) o la sesión NO
//   sobrevive al cerrar la app (Firebase cae a persistencia en memoria).
// - Web (Expo web): getAuth usa la persistencia de navegador por defecto.
// En firebase v12 `getReactNativePersistence` existe en runtime en el bundle RN
// (solo falta en las typings). Lo tomamos con require dentro de la rama nativa
// para que el build web no intente resolver un export que solo vive en nativo.
let authInstance;
if (Platform.OS === 'web') {
  authInstance = getAuth(app);
} else {
  const { initializeAuth, getReactNativePersistence } = require('firebase/auth');
  try {
    authInstance = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch {
    // Ya inicializado (p. ej. por Fast Refresh en desarrollo).
    authInstance = getAuth(app);
  }
}

export const auth = authInstance;
