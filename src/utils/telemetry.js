import { Platform } from 'react-native';
import { ref, push, serverTimestamp } from 'firebase/database';
import { db, auth } from './db';

// Observador Kaizen (móvil): registra errores y fricciones en Firebase RTDB para
// que el dueño los revise y mejore en continuo. Best-effort: NUNCA lanza.
// Espejo del telemetry.js de la web (mantener sincronizado).
//
// Requiere regla RTDB: "telemetry": { ".write": "auth != null", ".read": false }

let lastSig = '';
let lastAt = 0;

export function logEvent(type, payload = {}) {
  try {
    const sig = `${type}:${payload.message || ''}`;
    const now = Date.now();
    if (sig === lastSig && now - lastAt < 3000) return; // anti-spam
    lastSig = sig;
    lastAt = now;

    const entry = {
      type,
      ...payload,
      uid: (auth && auth.currentUser && auth.currentUser.uid) || null,
      email: (auth && auth.currentUser && auth.currentUser.email) || null,
      platform: Platform.OS, // 'ios' | 'android' | 'web'
      ts: serverTimestamp(),
      at: now,
    };
    const day = new Date().toISOString().slice(0, 10);
    push(ref(db, `telemetry/${day}`), entry).catch(() => {});
  } catch {
    /* nunca romper por telemetría */
  }
}

export function logError(error, context = {}) {
  const message = error?.message || String(error);
  const stack = error?.stack ? String(error.stack).slice(0, 2000) : null;
  logEvent('error', { message, stack, ...context });
}
