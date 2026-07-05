import { auth } from './db';

// expo-audio se importa DINÁMICAMENTE: si el módulo nativo no está en el build,
// la app no crashea al arrancar — solo queda sin voz (import estático dentro
// de un ErrorBoundary tumba toda la pantalla).
let AudioMod = null;
async function getAudio() {
  if (AudioMod) return AudioMod;
  AudioMod = await import('expo-audio');
  return AudioMod;
}

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
    const { setAudioModeAsync } = await getAudio();
    // playsInSilentMode: que suene aunque el iPhone esté en silencio (es una llamada).
    await setAudioModeAsync({ playsInSilentMode: true });
    audioModeReady = true;
  } catch { /* no bloquea */ }
}

// Habla el turno del lead con la emoción emitida por la IA.
// Devuelve una promesa que resuelve al terminar la reproducción.
export async function speak(text, { personalityId, language = 'es', emotion = 'neutral', gender = 'male' } = {}) {
  const uid = auth.currentUser?.uid;
  if (!text || !uid) return;
  const session = ++speakSession;

  stopSpeaking();
  await ensureAudioMode();

  try {
    const res = await fetch(`${API_BASE}/api/tts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid, text, personalityId, language, emotion, gender })
    });
    const data = await res.json();
    if (!res.ok || data.fallback || !data.audio) return; // silencio elegante

    if (session !== speakSession) return; // llegó otro speak()/stop mientras esperaba

    // expo-audio reproduce data URIs directamente (ExoPlayer / AVPlayer).
    const { createAudioPlayer } = await getAudio();
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
  } catch {
    // Sin red o TTS caído → el turno queda solo en texto. No romper el flujo.
  } finally {
    if (session === speakSession && currentPlayer) {
      try { currentPlayer.remove(); } catch { /* ya liberado */ }
      currentPlayer = null;
    }
  }
}

export function stopSpeaking() {
  speakSession++;
  if (currentPlayer) {
    try { currentPlayer.pause(); currentPlayer.remove(); } catch { /* ya liberado */ }
    currentPlayer = null;
  }
}
