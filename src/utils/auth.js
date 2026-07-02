import { Platform } from 'react-native';
import {
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { ref, update } from 'firebase/database';
import { auth, db } from './db';

const googleProvider = new GoogleAuthProvider();

export function signInWithGoogle() {
  // signInWithPopup es solo de navegador. En la app nativa, el login con Google
  // necesita expo-auth-session + OAuth Client IDs (configuración del dueño en
  // Firebase/Google Console). Todavía no habilitado en nativo → error claro.
  if (Platform.OS !== 'web') {
    return Promise.reject(
      new Error('El login con Google en la app nativa todavía no está habilitado. Usá email y contraseña por ahora.')
    );
  }
  return signInWithPopup(auth, googleProvider);
}

export function registerWithEmail(email, password) {
  return createUserWithEmailAndPassword(auth, email, password);
}

export function signInWithEmail(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

export function signOutUser() {
  return signOut(auth);
}

export function subscribeToAuthState(callback) {
  return onAuthStateChanged(auth, callback);
}

// Solo tocamos subscriptionStatus: es el único campo que las reglas de Firebase
// permiten escribir al cliente. subscriptionPlan y sessionsUsed quedan bajo
// control exclusivo del servidor (generate.js). Idéntico a la web.
export function activateFreePlan(uid) {
  return update(ref(db, `users/${uid}`), {
    subscriptionStatus: 'free'
  });
}
