import { OBJECTIONS_DICTIONARY } from './objectionsKnowledgeBase';
import { getFullScenarioPrompt } from './prompts/fullScenarioPrompt';
import { auth } from './db';
import { logError } from './telemetry';

// La app móvil NO trae su propio backend. Pega al MISMO proxy serverless de la
// web de PC (que guarda la AI_API_KEY del servidor y controla la cuota por
// usuario). Así: el usuario NO necesita traer su propia API key, y el escenario
// sale idéntico al que genera la web. La URL DEBE ser absoluta (en nativo no hay
// origin contra el cual resolver una ruta relativa como "/api/generate").
const API_BASE = 'https://sales-arena.netlify.app';
const GENERATE_URL = `${API_BASE}/api/generate`;

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

async function makeProxyCall(prompt, retriesLeft = 2, maxTokens = 1500) {
  const user = auth.currentUser;
  const requestBody = {
    prompt,
    uid: user?.uid,
    email: user?.email,
    max_tokens: maxTokens,
  };

  try {
    const response = await fetch(GENERATE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      // Rate limit: esperar lo sugerido y reintentar una vez.
      if (response.status === 429 && retriesLeft > 0) {
        let waitMs = 8000;
        try {
          const rl = await response.clone().json();
          const msg = rl?.error?.message || rl?.error || '';
          const match = /try again in ([\d.]+)s/i.exec(msg);
          if (match) waitMs = Math.min(Math.ceil(parseFloat(match[1]) * 1000) + 500, 20000);
        } catch { /* usar default */ }
        await sleep(waitMs);
        return makeProxyCall(prompt, retriesLeft - 1, maxTokens);
      }

      // Timeouts/errores transitorios del proveedor: reintentar con invocación fresca.
      const isRetryable = (response.status === 504 || response.status === 502 || response.status === 503) && retriesLeft > 0;
      if (isRetryable) {
        return makeProxyCall(prompt, retriesLeft - 1, maxTokens);
      }

      let errorData;
      try {
        errorData = await response.json();
      } catch {
        throw new Error(`Error del servidor (${response.status}). Intentá de nuevo en unos minutos.`);
      }
      if (errorData?.error === 'session_limit_reached') {
        throw new Error('Alcanzaste el límite de sesiones de tu plan. Actualizá tu suscripción para generar más escenarios.');
      }
      if (errorData?.error === 'timeout_upstream') {
        throw new Error('La IA tardó demasiado en responder. Intentá de nuevo — si persiste, probá en unos minutos.');
      }
      if (response.status === 401) {
        throw new Error('Se requiere iniciar sesión para generar escenarios.');
      }
      if (response.status === 429) {
        throw new Error('El servicio de IA está saturado. Esperá unos segundos y volvé a intentar.');
      }
      throw new Error(errorData?.error?.message || errorData?.error || errorData?.message || 'Error en la API');
    }

    const data = await response.json();

    // Blindaje: shape inesperado no debe reventar con un error críptico.
    const content = data?.choices?.[0]?.message?.content;
    if (typeof content !== 'string' || content.trim() === '') {
      throw new Error('La IA devolvió una respuesta vacía o con un formato inesperado. Probá de nuevo.');
    }

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('La respuesta de la IA no tenía formato JSON válido.');
    }

    try {
      return JSON.parse(jsonMatch[0]);
    } catch {
      throw new Error('La IA devolvió un JSON mal formado. Volvé a intentar en unos segundos.');
    }
  } catch (error) {
    console.error('AI Generation error:', error);
    logError(error, { source: 'ai_generate' });
    if (error.name === 'TypeError' && /fetch/i.test(error.message || '')) {
      throw new Error('Error de conexión. Revisá tu internet e intentá de nuevo.');
    }
    throw error;
  }
}

export async function generateAIScenario(config, stages = [], language = 'es') {
  const activeStages = stages && stages.length > 0 ? stages : [
    { id: 'apertura', label: 'Apertura', baseQuestions: 'Romper hielo', baseObjections: '' }
  ];

  let selectedObjectionKey = config.targetObjection;
  let specificObjectionFramework = '';

  if (!selectedObjectionKey || selectedObjectionKey === 'Aleatoria (Sorpréndeme)') {
    selectedObjectionKey = 'Aleatoria (Sorpréndeme)';
    specificObjectionFramework = 'INSTRUCCIÓN ESPECIAL: El usuario ha seleccionado "Sorpréndeme". Eres totalmente libre de INVENTAR la objeción principal más dolorosa, desafiante y atípica basada estrictamente en la Industria y el perfil psicológico generado. ¡Sé creativo y evita los clichés típicos!';
  } else {
    specificObjectionFramework = OBJECTIONS_DICTIONARY[selectedObjectionKey] || '';
  }

  const fullPrompt = getFullScenarioPrompt({
    level: config.level,
    theme: config.theme,
    leadTemperature: config.leadTemperature,
    targetObjection: selectedObjectionKey,
    specificObjectionFramework,
    activeStages,
    language
  });

  // 2800 tokens de salida acomoda todos los campos sin acercarse al límite de Groq.
  return makeProxyCall(fullPrompt, 2, 2800);
}

export async function generateSurpriseEvent(scenario, language = 'es') {
  if (!scenario) {
    throw new Error('No hay un escenario activo para generar el evento.');
  }

  const prompt = `
Actúa como un director de simulaciones de ventas. Tienes que crear UN EVENTO SORPRESA ALEATORIO (tipo "plot twist") para el siguiente Lead con el que un vendedor está hablando en este momento.

Contexto del Lead:
- Nombre: ${scenario.demographics?.name || 'Cliente'}
- Industria/Cargo: ${scenario.demographics?.industry || 'Empresa'} - ${scenario.demographics?.role || 'Dueño'}
- Problema actual: ${scenario.currentSituation?.problem || 'Tiene un problema a resolver'}
- Objeción principal (NO repetirla): ${scenario.visibleObjection || 'Ninguna'}

Requisitos del evento sorpresa:
1. Debe ser un suceso INESPERADO que interrumpa o cambie radicalmente el rumbo de la llamada de ventas.
2. NO debe ser simplemente otra objeción de precio o tiempo.
3. Debe estar íntimamente relacionado con su industria, cargo o problema actual.
4. Tienes un pool mental de más de 100 tipos de eventos diferentes (llamadas entrantes, emergencias, confesiones inesperadas, la aparición de un socio/jefe, problemas técnicos, revelaciones de la competencia, etc.). Elige uno al azar.
5. Redáctalo en 1 o 2 oraciones, de forma impactante, en ${language === 'es' ? 'Español' : 'Inglés'}.

Responde ÚNICAMENTE en formato JSON con la siguiente estructura:
{
  "eventText": "Texto del evento sorpresa que debe leer el actor."
}
`;

  const result = await makeProxyCall(prompt);
  return result.eventText;
}
