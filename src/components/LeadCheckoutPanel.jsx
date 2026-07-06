import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, ScrollView, ActivityIndicator } from 'react-native';
import { ShoppingCart, X, AlertCircle, CheckCircle, Clock, CreditCard } from 'lucide-react-native';
import { colors, globalStyles } from '../theme/GlobalStyles';
import GlassPanel from './GlassPanel';

// ─── Flujo: CONVENCIDO (1 clic) ──────────────────────────────────────────────
function FlowConvinced({ onClose, onResult }) {
  const [done, setDone] = useState(false);
  const handleBuy = () => {
    setDone(true);
    setTimeout(() => onResult('closed'), 1200);
  };
  if (done) {
    return (
      <View style={styles.centerFlow}>
        <CheckCircle size={48} color={colors.success} />
        <Text style={[styles.flowTitle, { color: colors.success }]}>🎉 ¡Trato cerrado!</Text>
      </View>
    );
  }
  return (
    <View style={styles.centerFlow}>
      <Text style={{ fontSize: 44 }}>🤝</Text>
      <Text style={styles.flowTitle}>¡Listo para avanzar!</Text>
      <Text style={styles.flowSub}>Inversión: la del programa — ¿Avanzamos?</Text>
      <TouchableOpacity style={[globalStyles.btn, globalStyles.btnPrimary, styles.fullBtn]} onPress={handleBuy}>
        <Text style={globalStyles.btnText}>✅ ¡Sí, lo hacemos!</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[globalStyles.btn, globalStyles.btnOutline, styles.fullBtn]} onPress={onClose}>
        <Text style={[globalStyles.btnText, { color: colors.textMain }]}>Ahora no</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Flujo: DUDANDO (micro-fricciones) ───────────────────────────────────────
function FlowHesitant({ onClose, onResult }) {
  const [step, setStep] = useState(0);
  const [coupon, setCoupon] = useState('');
  const [couponError, setCouponError] = useState('');
  const [termsScrolled, setTermsScrolled] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);

  const handleFinish = () => {
    setProcessing(true);
    setTimeout(() => { setProcessing(false); setDone(true); setTimeout(() => onResult('closed'), 1200); }, 2500);
  };

  const onTermsScroll = (e) => {
    const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent;
    if (layoutMeasurement.height + contentOffset.y >= contentSize.height - 12) setTermsScrolled(true);
  };

  if (done) {
    return (
      <View style={styles.centerFlow}>
        <CheckCircle size={48} color={colors.success} />
        <Text style={[styles.flowTitle, { color: colors.success }]}>🎉 ¡Trato cerrado!</Text>
      </View>
    );
  }
  if (processing) {
    return (
      <View style={styles.centerFlow}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.flowSub}>Procesando pago...</Text>
      </View>
    );
  }

  return (
    <View>
      <View style={styles.progress}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={[styles.progressBar, { backgroundColor: i <= step ? colors.primary : 'rgba(255,255,255,0.1)' }]} />
        ))}
      </View>

      {step === 0 && (
        <View style={styles.centerFlow}>
          <AlertCircle size={40} color={colors.accent} />
          <Text style={styles.flowTitle}>¿Estás seguro?</Text>
          <Text style={styles.flowSub}>Esta es una inversión importante. Tomate un momento para revisar los detalles antes de confirmar.</Text>
          <TouchableOpacity style={[globalStyles.btn, globalStyles.btnPrimary, styles.fullBtn]} onPress={() => setStep(1)}>
            <Text style={globalStyles.btnText}>Sí, continuar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[globalStyles.btn, globalStyles.btnOutline, styles.fullBtn]} onPress={onClose}>
            <Text style={[globalStyles.btnText, { color: colors.textMain }]}>Necesito pensarlo más</Text>
          </TouchableOpacity>
        </View>
      )}

      {step === 1 && (
        <View>
          <Text style={styles.flowTitle}>¿Tenés un código de descuento?</Text>
          <View style={styles.couponRow}>
            <TextInput
              style={styles.input}
              value={coupon}
              onChangeText={(v) => { setCoupon(v); setCouponError(''); }}
              placeholder="PROMO2024"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="characters"
            />
            <TouchableOpacity
              style={[globalStyles.btn, globalStyles.btnOutline]}
              onPress={() => setCouponError('❌ Código inválido. El cupón venció o ya fue usado.')}
            >
              <Text style={[globalStyles.btnText, { color: colors.textMain }]}>Aplicar</Text>
            </TouchableOpacity>
          </View>
          {couponError ? <Text style={styles.errorText}>{couponError}</Text> : null}
          <TouchableOpacity style={[globalStyles.btn, globalStyles.btnPrimary, { marginTop: 14 }]} onPress={() => setStep(2)}>
            <Text style={globalStyles.btnText}>Continuar sin código</Text>
          </TouchableOpacity>
        </View>
      )}

      {step === 2 && (
        <View>
          <Text style={styles.flowTitle}>Leé los términos y condiciones</Text>
          <ScrollView style={styles.terms} onScroll={onTermsScroll} scrollEventThrottle={16}>
            <Text style={styles.termsText}>
              Al proceder con esta compra aceptás los siguientes términos: el servicio comienza inmediatamente tras la
              confirmación del pago. No se realizarán reembolsos luego de 7 días de activado el servicio. El cliente
              acepta utilizar la plataforma exclusivamente con fines de entrenamiento.{'\n\n'}
              El proveedor se reserva el derecho de modificar las características del servicio con 30 días de aviso previo.
              Los datos de las sesiones se almacenan de forma segura y no se comparten con terceros sin consentimiento.
              {'\n\n'}
            </Text>
            <Text style={[styles.termsText, { color: colors.success, fontWeight: 'bold' }]}>
              ✓ Llegaste al final de los términos.
            </Text>
          </ScrollView>
          <TouchableOpacity
            style={[globalStyles.btn, globalStyles.btnPrimary, { opacity: termsScrolled ? 1 : 0.5 }]}
            onPress={handleFinish}
            disabled={!termsScrolled}
          >
            <Text style={globalStyles.btnText}>{termsScrolled ? '✅ Acepto y confirmo' : 'Desplazate para continuar...'}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

// ─── Flujo: RETICENTE (tarjeta rechazada → abandona) ─────────────────────────
function FlowReluctant({ onClose, onResult }) {
  const [step, setStep] = useState(0);

  if (step === 0) {
    return (
      <View>
        <Text style={styles.flowTitle}>Datos de pago</Text>
        <TextInput style={styles.input} value="4242 4242 4242 4242" editable={false} />
        <View style={styles.cardRow}>
          <TextInput style={[styles.input, { flex: 1 }]} value="12/27" editable={false} />
          <TextInput style={[styles.input, { flex: 1 }]} value="***" editable={false} />
        </View>
        <TouchableOpacity style={[globalStyles.btn, globalStyles.btnPrimary, { marginTop: 14 }]} onPress={() => setStep(1)}>
          <CreditCard size={16} color="white" />
          <Text style={[globalStyles.btnText, { marginLeft: 6 }]}>Pagar ahora</Text>
        </TouchableOpacity>
      </View>
    );
  }
  if (step === 1) {
    return (
      <View style={styles.centerFlow}>
        <AlertCircle size={48} color={colors.danger} />
        <Text style={[styles.flowTitle, { color: colors.danger }]}>❌ Tarjeta rechazada</Text>
        <Text style={styles.flowSub}>Hubo un problema al procesar tu pago. Revisá los datos o intentá con otra tarjeta.</Text>
        <TouchableOpacity style={[globalStyles.btn, globalStyles.btnOutline, styles.fullBtn]} onPress={() => setStep(2)}>
          <Text style={[globalStyles.btnText, { color: colors.textMain }]}>Intentar con otra tarjeta</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[globalStyles.btn, globalStyles.btnOutline, styles.fullBtn]} onPress={() => setStep(3)}>
          <Text style={[globalStyles.btnText, { color: colors.textMuted }]}>Lo tengo que consultar con mi socio</Text>
        </TouchableOpacity>
      </View>
    );
  }
  if (step === 2) {
    return (
      <View>
        <Text style={styles.flowTitle}>Intentar con otra tarjeta</Text>
        <TextInput style={styles.input} placeholder="Número de tarjeta" placeholderTextColor={colors.textMuted} keyboardType="number-pad" />
        <View style={styles.cardRow}>
          <TextInput style={[styles.input, { flex: 1 }]} placeholder="MM/YY" placeholderTextColor={colors.textMuted} />
          <TextInput style={[styles.input, { flex: 1 }]} placeholder="CVV" placeholderTextColor={colors.textMuted} />
        </View>
        <TouchableOpacity style={[globalStyles.btn, globalStyles.btnPrimary, { marginTop: 14 }]} onPress={() => setStep(3)}>
          <Text style={globalStyles.btnText}>Intentar de nuevo</Text>
        </TouchableOpacity>
      </View>
    );
  }
  // step 3: abandona
  return (
    <View style={styles.centerFlow}>
      <Clock size={48} color={colors.textMuted} />
      <Text style={styles.flowTitle}>Lo voy a pensar...</Text>
      <Text style={styles.flowSub}>&ldquo;Necesito consultarlo con mi socio antes de decidir. Te aviso.&rdquo;</Text>
      <TouchableOpacity
        style={[globalStyles.btn, globalStyles.btnOutline, styles.fullBtn]}
        onPress={() => { onResult('abandoned'); onClose(); }}
      >
        <Text style={[globalStyles.btnText, { color: colors.textMain }]}>Cerrar</Text>
      </TouchableOpacity>
    </View>
  );
}

function CheckoutModal({ frictionLevel, onClose, onResult }) {
  const titles = {
    convinced: '✅ Listo para comprar',
    hesitant: '🤔 Lo estoy pensando...',
    reluctant: '😬 No estoy tan seguro...',
  };
  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <GlassPanel style={styles.modalPanel}>
          <TouchableOpacity style={styles.close} onPress={onClose} hitSlop={10}>
            <X size={20} color={colors.textMuted} />
          </TouchableOpacity>
          <Text style={styles.modalKicker}>CHECKOUT SIMULADO</Text>
          <Text style={styles.modalTitle}>{titles[frictionLevel]}</Text>
          {frictionLevel === 'convinced' && <FlowConvinced onClose={onClose} onResult={onResult} />}
          {frictionLevel === 'hesitant' && <FlowHesitant onClose={onClose} onResult={onResult} />}
          {frictionLevel === 'reluctant' && <FlowReluctant onClose={onClose} onResult={onResult} />}
        </GlassPanel>
      </View>
    </Modal>
  );
}

export default function LeadCheckoutPanel({ checkout, updateCheckoutPhase }) {
  const [frictionLevel, setFrictionLevel] = useState('hesitant');
  const [showCheckout, setShowCheckout] = useState(false);

  const levels = [
    { id: 'convinced', emoji: '😄', label: 'Convencido', color: colors.success, desc: 'Listo para comprar, un clic' },
    { id: 'hesitant', emoji: '🤔', label: 'Dudando', color: colors.accent, desc: 'Necesita más empuje, micro-fricciones' },
    { id: 'reluctant', emoji: '😬', label: 'Reticente', color: colors.danger, desc: 'Flujo complicado, abandona' },
  ];

  const active = levels.find((l) => l.id === frictionLevel);
  const phase = checkout?.phase || 'idle';
  const result = checkout?.result;

  const handleOpen = () => { updateCheckoutPhase('active'); setShowCheckout(true); };
  const handleResult = (res) => { updateCheckoutPhase('completed', res); setShowCheckout(false); };
  const handleClose = () => { if (phase === 'active') updateCheckoutPhase('idle'); setShowCheckout(false); };

  if (result) {
    const closed = result === 'closed';
    return (
      <GlassPanel style={{ borderColor: closed ? colors.success : colors.danger, alignItems: 'center' }}>
        <Text style={{ fontSize: 40 }}>{closed ? '🎉' : '😔'}</Text>
        <Text style={[styles.flowTitle, { color: closed ? colors.success : colors.danger }]}>
          {closed ? '¡Trato cerrado!' : 'Trato perdido'}
        </Text>
        <Text style={styles.flowSub}>Nivel de fricción: {active?.label}</Text>
      </GlassPanel>
    );
  }

  return (
    <GlassPanel style={{ borderColor: 'rgba(94,92,230,0.4)' }}>
      <View style={styles.panelHeader}>
        <ShoppingCart size={18} color={colors.primary} />
        <Text style={styles.panelTitle}>🎭 Tu Nivel de Fricción (privado)</Text>
      </View>
      <Text style={styles.panelDesc}>Solo vos ves esto. Elegí cómo vas a reaccionar cuando el Closer intente cerrar.</Text>

      <View style={{ gap: 8, marginBottom: 16 }}>
        {levels.map((l) => {
          const selected = frictionLevel === l.id;
          return (
            <TouchableOpacity
              key={l.id}
              onPress={() => phase === 'idle' && setFrictionLevel(l.id)}
              disabled={phase !== 'idle'}
              style={[styles.levelRow, { borderColor: selected ? l.color : colors.glassBorder }]}
            >
              <Text style={{ fontSize: 22 }}>{l.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.levelLabel, { color: selected ? l.color : colors.textMain }]}>{l.label}</Text>
                <Text style={styles.levelDesc}>{l.desc}</Text>
              </View>
              {selected && <View style={[styles.dot, { backgroundColor: l.color }]} />}
            </TouchableOpacity>
          );
        })}
      </View>

      {phase === 'idle' && checkout?.enabled && (
        <TouchableOpacity style={[globalStyles.btn, globalStyles.btnPrimary]} onPress={handleOpen}>
          <ShoppingCart size={18} color="white" />
          <Text style={[globalStyles.btnText, { marginLeft: 6 }]}>Iniciar checkout simulado</Text>
        </TouchableOpacity>
      )}
      {!checkout?.enabled && (
        <Text style={styles.waiting}>⏳ Esperando que el Trainer habilite la fase de Cierre...</Text>
      )}
      {phase === 'active' && (
        <Text style={[styles.waiting, { color: colors.accent }]}>⚡ Checkout en progreso...</Text>
      )}

      {showCheckout && (
        <CheckoutModal frictionLevel={frictionLevel} onClose={handleClose} onResult={handleResult} />
      )}
    </GlassPanel>
  );
}

const styles = StyleSheet.create({
  panelHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  panelTitle: { color: colors.primary, fontWeight: '700', fontSize: 15 },
  panelDesc: { color: colors.textMuted, fontSize: 13, lineHeight: 18, marginBottom: 14 },
  levelRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 12, borderRadius: 12, borderWidth: 1, backgroundColor: 'rgba(0,0,0,0.2)',
  },
  levelLabel: { fontWeight: '700', fontSize: 14 },
  levelDesc: { color: colors.textMuted, fontSize: 12 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  waiting: {
    textAlign: 'center', color: colors.textMuted, fontSize: 13,
    padding: 12, backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 8,
  },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center', padding: 16 },
  modalPanel: { maxWidth: 420, width: '100%' },
  close: { position: 'absolute', top: 12, right: 12, zIndex: 2, padding: 4 },
  modalKicker: { fontSize: 11, color: colors.textMuted, letterSpacing: 1, marginBottom: 4 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: colors.textMain, marginBottom: 18 },
  centerFlow: { alignItems: 'center', gap: 10 },
  flowTitle: { fontSize: 18, fontWeight: '700', color: colors.textMain, textAlign: 'center', marginTop: 6 },
  flowSub: { color: colors.textMuted, fontSize: 14, textAlign: 'center', lineHeight: 20, marginBottom: 8 },
  fullBtn: { width: '100%', marginTop: 8 },
  progress: { flexDirection: 'row', gap: 4, marginBottom: 18 },
  progressBar: { flex: 1, height: 4, borderRadius: 2 },
  input: {
    backgroundColor: 'rgba(255,255,255,0.04)', borderColor: colors.glassBorder, borderWidth: 1,
    borderRadius: 10, paddingHorizontal: 12, paddingVertical: 12, color: colors.textMain, fontSize: 14, marginBottom: 8,
  },
  couponRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  cardRow: { flexDirection: 'row', gap: 8 },
  errorText: { color: colors.danger, fontSize: 13, marginTop: 4 },
  terms: {
    maxHeight: 160, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 8, padding: 12,
    borderWidth: 1, borderColor: colors.glassBorder, marginBottom: 14,
  },
  termsText: { color: colors.textMuted, fontSize: 13, lineHeight: 19 },
});
