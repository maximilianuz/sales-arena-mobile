import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import { auth } from './db';

// Voz del lead en la app móvil — mismo backend que la web.
// Llama al proxy /api/tts (Fish Audio S2.1 Pro con emotion tags) y reproduce
// el MP3 con expo-audio. Si el servicio falla, falla en silencio: el roleplay
// sigue por texto (no hay SpeechSynthesis nativo equivalente sin otra dep).
// Sincronizar con: sales-arena/src/utils/voice.js (web).

const API_BASE = 'https://sales-arena.netlify.app';

let currentPlayer = null;
let speakSession = 0;
let audioModeReady = false;

async function ensureAudioMode() {
  if (audioModeReady) return;
  try {
    // playsInSilentMode: que suene aunque el iPhone esté en silencio (es una llamada).
    await setAudioModeAsync({ playsInSilentMode: true });
    audioModeReady = true;
  } catch (_) { /* no bloquea */ }
}

// Habla el turno del lead con la emoción emitida por la IA.
// Devuelve una promesa que resuelve al terminar la reproducción.
export async function speak(text, { personalityId, language = 'es', emotion = 'neutral' } = {}) {
  const uid = auth.currentUser?.uid;
  if (!text || !uid) return;
  const session = ++speakSession;

  stopSpeaking();
  await ensureAudioMode();

  try {
    const res = await fetch(`${API_BASE}/api/tts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid, text, personalityId, language, emotion })
    });
    const data = await res.json();
    if (!res.ok || data.fallback || !data.audio) return; // silencio elegante

    if (session !== speakSession) return; // llegó otro speak()/stop mientras esperaba

    // expo-audio reproduce data URIs directamente (ExoPlayer / AVPlayer).
    const player = createAudioPlayer({ uri: `data:${data.mimeType || 'audio/mpeg'};base64,${data.audio}` });
    currentPlayer = player;

    await new Promise((resolve) => {
      const sub = player.addListener('playbackStatusUpdate', (status) => {
        if (status.didJustFinish) { sub.remove(); resolve(); }
      });
      player.play();
      // Red de seguridad: si el evento no llega (audio corrupto), liberar a los 60s.
      setTimeout(() => { sub.remove(); resolve(); }, 60000);
    });
  } catch (_) {
    // Sin red o TTS caído → el turno queda solo en texto. No romper el flujo.
  } finally {
    if (session === speakSession && currentPlayer) {
      try { currentPlayer.release(); } catch (_) { /* ya liberado */ }
      currentPlayer = null;
    }
  }
}

export function stopSpeaking() {
  speakSession++;
  if (currentPlayer) {
    try { currentPlayer.pause(); currentPlayer.release(); } catch (_) { /* ya liberado */ }
    currentPlayer = null;
  }
}
