import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Send, Phone, PhoneOff, Flame, Shield, Clock, Eye, Sparkles, Trophy } from 'lucide-react-native';
import { colors, globalStyles } from '../theme/GlobalStyles';
import GlassPanel from '../components/GlassPanel';
import BuyerAvatar from '../components/BuyerAvatar';
import { generateAIScenario } from '../utils/universalAiClient';
import { buyerTurn, initialBuyerState, scoreSolo } from '../utils/roleplayClient';
import { openingLine } from '../utils/buyerPrompt';
import { speak, stopSpeaking } from '../utils/voice';
import { inferGender } from '../utils/genderFromName';
import MethodScores from '../components/MethodScores';

// Expresión emocional del lead por turno (la emite la IA; sincronizar con la web).
const EMOTION_META = {
  neutral:      { emoji: '😐', es: 'neutral', en: 'neutral' },
  interesado:   { emoji: '🙂', es: 'interesado', en: 'interested' },
  esceptico:    { emoji: '🤨', es: 'escéptico', en: 'skeptical' },
  molesto:      { emoji: '😠', es: 'molesto', en: 'annoyed' },
  entusiasmado: { emoji: '😄', es: 'entusiasmado', en: 'excited' },
  dudoso:       { emoji: '😕', es: 'dudoso', en: 'hesitant' },
  apurado:      { emoji: '⏱️', es: 'apurado', en: 'in a hurry' }
};

// Modo PRÁCTICA SOLO (móvil): el closer le vende al comprador IA con estado real
// (temperatura/confianza/paciencia), capa oculta y consecuencias. Al terminar
// scorea el transcript con la misma rúbrica. Voz pendiente (requiere expo-av/speech).

const METERS = [
  { key: 'temperature', Icon: Flame, es: 'Interés', en: 'Interest', color: '#ff9f0a' },
  { key: 'trust', Icon: Shield, es: 'Confianza', en: 'Trust', color: '#22d3ee' },
  { key: 'patience', Icon: Clock, es: 'Paciencia', en: 'Patience', color: '#a78bfa' },
];

export default function SoloScreen() {
  const { i18n } = useTranslation();
  const isEn = (i18n.language || '').startsWith('en');
  const router = useRouter();

  const [phase, setPhase] = useState('intro'); // intro | loading | live | ended
  const [scenario, setScenario] = useState(null);
  const [state, setState] = useState(initialBuyerState());
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [outcome, setOutcome] = useState(null);
  const [thoughts, setThoughts] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [scoring, setScoring] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollToEnd({ animated: true }); }, [messages, phase]);

  const leadName = scenario?.demographics?.name || (isEn ? 'Prospect' : 'Prospecto');

  const start = async () => {
    setPhase('loading');
    setError('');
    try {
      const sc = await generateAIScenario({ level: 'intermedio', theme: '', leadTemperature: 'tibio', targetObjection: 'Aleatoria (Sorpréndeme)' }, [], i18n.language);
      if (!sc || typeof sc !== 'object') throw new Error(isEn ? 'Could not generate the buyer.' : 'No se pudo generar el comprador.');
      setScenario(sc);
      // Saludo local (sin IA) para no gatillar el rate limit de Groq justo
      // después de generar el escenario. La IA responde desde el 1er turno.
      setState(initialBuyerState());
      setMessages([{ role: 'assistant', content: openingLine(sc, i18n.language) }]);
      setThoughts([]);
      setPhase('live');
    } catch (e) {
      setError(e.message);
      setPhase('intro');
    }
  };

  const send = async () => {
    const text = input.trim();
    if (!text || busy || phase !== 'live') return;
    setInput('');
    setError('');
    const nextHistory = [...messages, { role: 'user', content: text }];
    setMessages(nextHistory);
    setBusy(true);
    try {
      const turn = await buyerTurn({ scenario, state, history: nextHistory, language: i18n.language });
      setState(turn.state);
      setMessages([...nextHistory, { role: 'assistant', content: turn.reply, emotion: turn.emotion }]);
      if (turn.thought) setThoughts(t => [...t, turn.thought]);
      if (turn.outcome === 'closed' || turn.outcome === 'lost') {
        setOutcome(turn.outcome);
        setPhase('ended');
      }
      // Voz del lead con la emoción del turno (Fish Audio via backend; silencioso si falla).
      speak(turn.reply, { personalityId: scenario?.personality, language: i18n.language, emotion: turn.emotion, gender: inferGender(scenario?.demographics?.name || '') });
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const scoreSession = async () => {
    setScoring(true);
    setError('');
    try {
      const transcript = messages.map(m => `${m.role === 'user' ? 'CLOSER' : leadName.toUpperCase()}: ${m.content}`).join('\n');
      const data = await scoreSolo({ scenario, transcript, closed: outcome === 'closed', language: i18n.language });
      setAnalysis({ ...data.analysis, gamification: data.gamification });
    } catch (e) {
      setError(e.message);
    } finally {
      setScoring(false);
    }
  };

  // ── Intro ──
  if (phase === 'intro' || phase === 'loading') {
    return (
      <View style={[globalStyles.container, { padding: 20, justifyContent: 'center' }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={18} color="white" /><Text style={styles.backTxt}>{isEn ? 'Back' : 'Volver'}</Text>
        </TouchableOpacity>
        <GlassPanel style={{ padding: 24, alignItems: 'center' }}>
          <Text style={{ fontSize: 40 }}>🎯</Text>
          <Text style={styles.title}>{isEn ? 'Solo practice — AI Buyer' : 'Práctica solo — Comprador IA'}</Text>
          <Text style={styles.intro}>
            {isEn
              ? 'A real, skeptical prospect with hidden objections and a mood that shifts with your technique. Earn their trust — or lose the call.'
              : 'Un prospecto real y escéptico, con objeciones ocultas y un ánimo que cambia según tu técnica. Ganate su confianza — o perdé la llamada.'}
          </Text>
          {error ? <Text style={styles.err}>{error}</Text> : null}
          <TouchableOpacity style={[globalStyles.btn, globalStyles.btnPrimary, { marginTop: 16, width: '100%', flexDirection: 'row', justifyContent: 'center', gap: 8 }]} onPress={start} disabled={phase === 'loading'}>
            {phase === 'loading'
              ? <><ActivityIndicator color="white" /><Text style={globalStyles.btnText}>{isEn ? 'Generating…' : 'Generando…'}</Text></>
              : <><Phone size={18} color="white" /><Text style={globalStyles.btnText}>{isEn ? 'Start the call' : 'Iniciar la llamada'}</Text></>}
          </TouchableOpacity>
        </GlassPanel>
      </View>
    );
  }

  // ── Ended ──
  if (phase === 'ended') {
    return (
      <ScrollView style={globalStyles.container} contentContainerStyle={{ padding: 20 }}>
        <GlassPanel style={{ padding: 24, alignItems: 'center', marginBottom: 12 }}>
          <Text style={{ fontSize: 40 }}>{outcome === 'closed' ? '🤝' : '📞'}</Text>
          <Text style={[styles.title, { color: outcome === 'closed' ? colors.success : colors.textMuted }]}>
            {outcome === 'closed' ? (isEn ? 'Deal closed!' : '¡Trato cerrado!') : (isEn ? 'Call ended' : 'Llamada terminada')}
          </Text>
          {thoughts.length > 0 && (
            <View style={styles.thoughtBox}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <Eye size={14} color="#a78bfa" />
                <Text style={styles.thoughtTitle}>{isEn ? 'What the buyer really thought' : 'Lo que el comprador pensaba de verdad'}</Text>
              </View>
              {thoughts.slice(-4).map((th, i) => <Text key={i} style={styles.thought}>“{th}”</Text>)}
            </View>
          )}
          {!analysis && (
            <TouchableOpacity style={[globalStyles.btn, globalStyles.btnPrimary, { marginTop: 16, width: '100%', flexDirection: 'row', justifyContent: 'center', gap: 8 }]} onPress={scoreSession} disabled={scoring}>
              {scoring ? <ActivityIndicator color="white" /> : <Sparkles size={16} color="white" />}
              <Text style={globalStyles.btnText}>{isEn ? 'Score my call' : 'Puntuar mi llamada'}</Text>
            </TouchableOpacity>
          )}
          {error ? <Text style={styles.err}>{error}</Text> : null}
        </GlassPanel>

        {analysis && (
          <GlassPanel style={{ padding: 20, marginBottom: 12 }}>
            <View style={{ alignItems: 'center', marginBottom: 12 }}>
              <Text style={{ fontSize: 44, fontWeight: '900', color: analysis.overallScore >= 8 ? colors.success : analysis.overallScore >= 6 ? colors.accent : colors.danger }}>{analysis.overallScore}/10</Text>
              {analysis.gamification?.earned > 0 && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Trophy size={16} color={colors.success} />
                  <Text style={{ color: colors.success, fontWeight: '800' }}>+${analysis.gamification.earned.toLocaleString('en-US')}</Text>
                </View>
              )}
            </View>
            {(analysis.toImprove || []).map((it, i) => <Text key={i} style={styles.improve}>→ {it}</Text>)}
            <MethodScores scores={analysis.methodScores} />
            {analysis.nextSessionTip ? <Text style={styles.tip}>💡 {analysis.nextSessionTip}</Text> : null}
            <Text style={styles.soloNote}>
              {isEn
                ? 'Solo practice earns 0.5× — real team sessions are worth double.'
                : 'La práctica solo vale 0.5× — las sesiones reales en equipo valen doble.'}
            </Text>
          </GlassPanel>
        )}

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <TouchableOpacity style={[globalStyles.btn, { flex: 1, borderWidth: 1, borderColor: colors.glassBorder }]} onPress={() => router.back()}>
            <Text style={globalStyles.btnText}>{isEn ? 'Lobby' : 'Lobby'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[globalStyles.btn, globalStyles.btnPrimary, { flex: 1 }]} onPress={() => { stopSpeaking(); setPhase('intro'); setScenario(null); setMessages([]); setThoughts([]); setAnalysis(null); setOutcome(null); setState(initialBuyerState()); }}>
            <Text style={globalStyles.btnText}>{isEn ? 'New call' : 'Nueva llamada'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  // ── Live ──
  return (
    <KeyboardAvoidingView style={globalStyles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={{ flex: 1, padding: 14 }}>
        <GlassPanel style={{ padding: 14, marginBottom: 10 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <TouchableOpacity onPress={() => router.back()}><ArrowLeft size={18} color={colors.textMuted} /></TouchableOpacity>
            <TouchableOpacity onPress={() => { setOutcome('lost'); setPhase('ended'); }} style={styles.hangup}>
              <PhoneOff size={16} color={colors.danger} />
            </TouchableOpacity>
          </View>
          {/* Solo el nombre: la personalidad DISC no se muestra al closer —
              la descubre conversando (como en la vida real). */}
          <View style={{ alignItems: 'center', marginBottom: 10 }}>
            <BuyerAvatar state={state} name={leadName} isEn={isEn} size={110} />
          </View>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            {METERS.map(m => (
              <View key={m.key} style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 3 }}>
                  <m.Icon size={11} color={m.color} />
                  <Text style={styles.meterLbl}>{isEn ? m.en : m.es}</Text>
                </View>
                <View style={styles.track}><View style={{ height: '100%', width: `${state[m.key]}%`, backgroundColor: m.color, borderRadius: 3 }} /></View>
              </View>
            ))}
          </View>
        </GlassPanel>

        <ScrollView ref={scrollRef} style={{ flex: 1 }} contentContainerStyle={{ gap: 8, paddingVertical: 4 }}>
          {messages.map((m, i) => (
            <View key={i} style={[styles.bubble, m.role === 'user' ? styles.bubbleUser : styles.bubbleLead]}>
              {m.role !== 'user' && m.emotion && m.emotion !== 'neutral' && EMOTION_META[m.emotion] && (
                <Text style={styles.emotionChip}>
                  {EMOTION_META[m.emotion].emoji} {isEn ? EMOTION_META[m.emotion].en : EMOTION_META[m.emotion].es}
                </Text>
              )}
              <Text style={styles.bubbleText}>{m.content}</Text>
            </View>
          ))}
          {busy && <Text style={styles.thinking}>{leadName} {isEn ? 'is thinking…' : 'está pensando…'}</Text>}
        </ScrollView>

        {error ? <Text style={styles.err}>{error}</Text> : null}

        <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder={isEn ? 'Type what you say…' : 'Escribí lo que decís…'}
            placeholderTextColor={colors.textMuted}
            editable={!busy}
            style={styles.input}
            onSubmitEditing={send}
          />
          <TouchableOpacity style={[globalStyles.btn, globalStyles.btnPrimary, { paddingHorizontal: 18, justifyContent: 'center' }]} onPress={send} disabled={busy || !input.trim()}>
            <Send size={18} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16 },
  backTxt: { color: 'white' },
  title: { fontSize: 20, fontWeight: '800', color: 'white', textAlign: 'center', marginVertical: 8 },
  intro: { color: colors.textMuted, fontSize: 14, lineHeight: 20, textAlign: 'center' },
  err: { color: colors.danger, fontSize: 13, marginTop: 10, textAlign: 'center' },
  hangup: { backgroundColor: 'rgba(255,69,58,0.12)', borderWidth: 1, borderColor: 'rgba(255,69,58,0.3)', borderRadius: 10, padding: 8 },
  meterLbl: { fontSize: 10, color: colors.textMuted },
  track: { height: 5, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' },
  bubble: { maxWidth: '82%', padding: 10, borderRadius: 14 },
  bubbleUser: { alignSelf: 'flex-end', backgroundColor: colors.primary, borderBottomRightRadius: 4 },
  bubbleLead: { alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.06)', borderBottomLeftRadius: 4 },
  bubbleText: { color: 'white', fontSize: 14, lineHeight: 19 },
  emotionChip: { color: 'rgba(255,255,255,0.45)', fontSize: 11, fontStyle: 'italic', marginBottom: 3 },
  thinking: { color: colors.textMuted, fontStyle: 'italic', fontSize: 13, paddingLeft: 8 },
  input: { flex: 1, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: colors.glassBorder, borderRadius: 12, color: 'white', paddingHorizontal: 14, paddingVertical: 10, fontSize: 14 },
  thoughtBox: { alignSelf: 'stretch', marginTop: 12, padding: 12, backgroundColor: 'rgba(139,92,246,0.08)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(139,92,246,0.2)' },
  thoughtTitle: { fontSize: 12, fontWeight: '700', color: '#a78bfa', textTransform: 'uppercase' },
  thought: { fontSize: 13, color: colors.textMuted, fontStyle: 'italic', marginBottom: 4 },
  improve: { fontSize: 13, color: colors.textMuted, marginBottom: 5 },
  tip: { marginTop: 10, padding: 10, backgroundColor: 'rgba(245,158,11,0.08)', borderRadius: 10, fontSize: 13, color: colors.textMuted },
  soloNote: { marginTop: 10, fontSize: 11, color: 'rgba(255,255,255,0.35)', textAlign: 'center' },
});
