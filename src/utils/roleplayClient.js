import { auth } from './db';
import { buildBuyerSystem, initialBuyerState } from './buyerPrompt';

// Cliente del COMPRADOR IA (móvil). Espejo del web: pega al MISMO proxy
// serverless de la web (API absoluta, en nativo no hay origin relativo).
// El estado vive en el cliente y se reinyecta cada turno = memoria emocional.

const API_BASE = 'https://sales-arena.netlify.app';
const TURN_URL = `${API_BASE}/api/roleplay-turn`;
const ANALYZE_URL = `${API_BASE}/api/analyze-session`;

export { initialBuyerState };

export async function buyerTurn({ scenario, state, history, language = 'es' }) {
  const system = buildBuyerSystem(scenario, state, language);
  const res = await fetch(TURN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ uid: auth.currentUser?.uid, system, messages: history }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error en el turno');
  return data; // { reply, state, revealedHiddenObjection, thought, outcome }
}

// Scorea el transcript del modo solo con la misma rúbrica (analyze-session).
export async function scoreSolo({ scenario, transcript, closed, language = 'es' }) {
  const user = auth.currentUser;
  const res = await fetch(ANALYZE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      uid: user?.uid,
      scenario,
      transcript,
      closed,
      closerUid: user?.uid,
      closerName: user?.displayName || user?.email?.split('@')[0] || 'Closer',
      productPrice: scenario?.productPrice,
      language,
      soloMode: true,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error');
  return data; // { analysis, gamification }
}
