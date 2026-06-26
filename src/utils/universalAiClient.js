import { OBJECTIONS_DICTIONARY } from './objectionsKnowledgeBase';
import { getIdentityPrompt } from './prompts/identityPrompt';
import { getObjectionsPrompt } from './prompts/objectionsPrompt';
import { getPipelinePrompt } from './prompts/pipelinePrompt';

/**
 * Universal AI Client that formats requests based on the provider
 */
async function makeUniversalAIPromptCall(prompt, config) {
  const { apiKey, apiUrl, apiModel, provider } = config;
  
  let finalUrl = apiUrl;
  let headers = {
    "Content-Type": "application/json"
  };
  let body = {};

  const cleanPrompt = prompt + "\n\nResponde ÚNICAMENTE con un objeto JSON válido, sin Markdown ni comillas invertidas.";

  if (provider === 'anthropic') {
    // Anthropic Claude Messages API
    finalUrl = finalUrl || "https://api.anthropic.com/v1/messages";
    headers["x-api-key"] = apiKey;
    headers["anthropic-version"] = "2023-06-01";
    // Si se llama desde el navegador, Anthropic suele bloquear por CORS a menos que se use un proxy.
    // Dejamos el header estándar pero es probable que requiera un backend en prod.
    
    body = {
      model: apiModel || "claude-3-5-sonnet-20240620",
      max_tokens: 1500,
      messages: [{ role: "user", content: cleanPrompt }]
    };
  } else if (provider === 'gemini') {
    // Google Gemini REST API
    finalUrl = finalUrl || `https://generativelanguage.googleapis.com/v1beta/models/${apiModel || 'gemini-1.5-flash'}:generateContent?key=${apiKey}`;
    body = {
      contents: [{
        parts: [{ text: cleanPrompt }]
      }],
      generationConfig: {
        responseMimeType: "application/json"
      }
    };
  } else {
    // Default: OpenAI-compatible (OpenAI, NVIDIA, Groq, LlamaLocal, etc)
    finalUrl = finalUrl || "https://api.openai.com/v1/chat/completions";
    // Legacy fix for Nvidia direct integrate URL
    if (finalUrl.includes("integrate.api.nvidia.com")) {
      finalUrl = "https://integrate.api.nvidia.com/v1/chat/completions";
    }
    
    if (apiKey) {
      headers["Authorization"] = `Bearer ${apiKey}`;
    }

    body = {
      model: apiModel || "gpt-4o-mini",
      messages: [{ role: "user", content: cleanPrompt }],
      temperature: 0.7,
      max_tokens: 1500,
      response_format: { type: "json_object" }
    };
  }

  try {
    const response = await fetch(finalUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      let err;
      try { err = await response.json(); } catch(e) { err = { error: response.statusText } }
      throw new Error(`API Error: ${JSON.stringify(err)}`);
    }

    const data = await response.json();
    let textContent = "";

    // Extraer texto dependiendo del proveedor
    if (provider === 'anthropic') {
      textContent = data.content[0].text;
    } else if (provider === 'gemini') {
      textContent = data.candidates[0].content.parts[0].text;
    } else {
      textContent = data.choices[0].message.content;
    }

    // Limpiar JSON si viene con bloques de markdown
    const jsonMatch = textContent.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    } else {
      throw new Error("La respuesta no tenía un formato JSON válido.");
    }
  } catch (error) {
    console.error("Universal API Generation error:", error);
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
    specificObjectionFramework = 'INSTRUCCIÓN ESPECIAL: El usuario ha seleccionado "Sorpréndeme". Eres libre de INVENTAR la objeción principal.';
  } else {
    specificObjectionFramework = OBJECTIONS_DICTIONARY[selectedObjectionKey] || '';
  }

  const identityPrompt = getIdentityPrompt({ 
    level: config.level, 
    theme: config.theme, 
    leadTemperature: config.leadTemperature, 
    language 
  });
  
  const baseProfile = await makeUniversalAIPromptCall(identityPrompt, config);

  const objectionsPrompt = getObjectionsPrompt({
    baseProfile,
    targetObjection: selectedObjectionKey,
    language,
    specificObjectionFramework,
    level: config.level
  });
  
  const objectionsProfile = await makeUniversalAIPromptCall(objectionsPrompt, config);

  const pipelinePrompt = getPipelinePrompt({
    baseProfile,
    objectionsProfile,
    activeStages,
    specificObjectionFramework,
    language
  });
  
  const pipelineProfile = await makeUniversalAIPromptCall(pipelinePrompt, config);

  return {
    ...baseProfile,
    ...objectionsProfile,
    ...pipelineProfile
  };
}

export async function generateSurpriseEvent(config, scenario, language = 'es') {
  if (!scenario) throw new Error("No hay un escenario activo.");
  
  const prompt = `
Actúa como un director de simulaciones de ventas. Tienes que crear UN EVENTO SORPRESA ALEATORIO (tipo "plot twist") para el siguiente Lead.
Contexto del Lead:
- Nombre: ${scenario.demographics?.name || 'Cliente'}
- Industria/Cargo: ${scenario.demographics?.industry || 'Empresa'} - ${scenario.demographics?.role || 'Dueño'}

Responde ÚNICAMENTE en formato JSON con la siguiente estructura:
{
  "eventText": "Texto del evento sorpresa que debe leer el actor."
}
`;

  const result = await makeUniversalAIPromptCall(prompt, config);
  return result.eventText;
}
