import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Line, Ellipse, Path } from 'react-native-svg';

// Avatar reactivo estilizado del comprador IA (móvil). Espejo del web con
// react-native-svg: la cara refleja el estado (temperatura/confianza/paciencia)
// que ya calcula el buyer. Costo $0, atado a NUESTRO modelo psicológico.

function tempColor(t) {
  const hue = 210 - (Math.max(0, Math.min(100, t)) / 100) * 190;
  return `hsl(${hue}, 70%, 55%)`;
}

function moodLabel(state, isEn) {
  const { temperature: t, trust: tr, patience: p } = state;
  if (p < 20) return isEn ? 'Impatient' : 'Impaciente';
  if (t < 20) return isEn ? 'Checked out' : 'Se enfría';
  if (tr < 25) return isEn ? 'Guarded' : 'A la defensiva';
  if (t > 70 && tr > 60) return isEn ? 'Warming up' : 'Enganchado';
  if (tr > 55) return isEn ? 'Opening up' : 'Se abre';
  return isEn ? 'Neutral' : 'Neutral';
}

export default function BuyerAvatar({ state, speaking = false, name = '', isEn = false, size = 120 }) {
  const t = state?.temperature ?? 35;
  const tr = state?.trust ?? 25;
  const p = state?.patience ?? 70;

  const skin = tempColor(t);
  const browAngle = p < 40 ? (40 - p) / 3 : 0;
  const browLift = tr > 60 ? -3 : 0;
  const eyeOpen = tr < 25 ? 0.55 : tr < 55 ? 0.8 : 1;
  const eyeRy = 7 * eyeOpen;
  const curve = ((t - 45) / 100) * 18;
  const mouthPath = `M 60 118 Q 100 ${118 + curve} 140 118`;

  return (
    <View style={styles.wrap}>
      <View style={[styles.halo, { shadowColor: skin, shadowRadius: speaking ? 20 : 12 }]}>
        <Svg viewBox="0 0 200 200" width={size} height={size}>
          <Circle cx="100" cy="100" r="92" fill="none" stroke={skin} strokeWidth="2" opacity="0.35" />
          <Circle cx="100" cy="100" r="78" fill={skin} opacity="0.22" stroke={skin} strokeWidth="2.5" />

          <Line x1="62" y1={72 + browLift + browAngle} x2="86" y2={72 + browLift - browAngle} stroke="rgba(255,255,255,0.85)" strokeWidth="4" strokeLinecap="round" />
          <Line x1="114" y1={72 + browLift - browAngle} x2="138" y2={72 + browLift + browAngle} stroke="rgba(255,255,255,0.85)" strokeWidth="4" strokeLinecap="round" />

          <Ellipse cx="74" cy="90" rx="8" ry={eyeRy} fill="white" />
          <Ellipse cx="126" cy="90" rx="8" ry={eyeRy} fill="white" />
          <Circle cx="74" cy="91" r={3.2 * eyeOpen} fill="#1a1a2e" />
          <Circle cx="126" cy="91" r={3.2 * eyeOpen} fill="#1a1a2e" />

          {speaking
            ? <Ellipse cx="100" cy="120" rx="16" ry="9" fill="rgba(255,255,255,0.9)" />
            : <Path d={mouthPath} fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="4" strokeLinecap="round" />}
        </Svg>
      </View>
      {name ? <Text style={styles.name}>{name}</Text> : null}
      <Text style={[styles.mood, { color: skin }]}>{moodLabel({ temperature: t, trust: tr, patience: p }, isEn)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center' },
  halo: { shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, elevation: 6 },
  name: { fontWeight: '700', fontSize: 14, color: 'white', marginTop: 6 },
  mood: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
});
