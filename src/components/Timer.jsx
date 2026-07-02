import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Clock, Play, Pause, RotateCcw } from 'lucide-react-native';
import { colors } from '../theme/GlobalStyles';
import GlassPanel from './GlassPanel';

export default function Timer({ timerState, activeStageIndex, stages, updateTimer, maxMinutes }) {
  const [displayTime, setDisplayTime] = useState('00:00');
  const [isOvertime, setIsOvertime] = useState(false);

  const stage = stages?.[activeStageIndex || 0];
  // Tiempo configurado de la etapa (en segundos). Fallback 5 min.
  // Para plan free se topea en maxMinutes (igual que la web).
  const cap = maxMinutes ? maxMinutes * 60 : Infinity;
  const stageSeconds = Math.min((parseInt(stage?.estimatedTime, 10) || 5) * 60, cap);

  useEffect(() => {
    let intervalId;
    const tick = () => {
      let secondsLeft;
      if (timerState?.isRunning && timerState?.endTimestamp) {
        secondsLeft = Math.round((timerState.endTimestamp - Date.now()) / 1000);
      } else if (timerState && typeof timerState.timeLeft === 'number') {
        secondsLeft = timerState.timeLeft;
      } else {
        // Sin estado aún: mostramos el tiempo configurado de la etapa (no 00:00).
        secondsLeft = stageSeconds;
      }
      const over = secondsLeft < 0;
      setIsOvertime(over);
      const abs = Math.abs(secondsLeft);
      const mins = Math.floor(abs / 60);
      const secs = abs % 60;
      setDisplayTime(`${over ? '-' : ''}${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`);
    };

    tick();
    if (timerState?.isRunning) intervalId = setInterval(tick, 1000);
    return () => clearInterval(intervalId);
  }, [timerState, stageSeconds]);

  const canControl = !!updateTimer;

  const handleStart = () => {
    const base = (timerState && typeof timerState.timeLeft === 'number' && timerState.timeLeft > 0)
      ? timerState.timeLeft
      : stageSeconds;
    const secs = Math.min(base, cap);
    updateTimer({ isRunning: true, endTimestamp: Date.now() + secs * 1000, timeLeft: secs });
  };

  const handlePause = () => {
    const remaining = timerState?.endTimestamp
      ? Math.round((timerState.endTimestamp - Date.now()) / 1000)
      : (timerState?.timeLeft || 0);
    updateTimer({ isRunning: false, endTimestamp: null, timeLeft: remaining });
  };

  const handleReset = () => {
    updateTimer({ isRunning: false, endTimestamp: null, timeLeft: stageSeconds });
  };

  return (
    <GlassPanel style={styles.container}>
      <View style={styles.header}>
        <Clock size={16} color={colors.textMuted} />
        <Text style={styles.title}>Tiempo de la Etapa</Text>
      </View>
      <Text style={[styles.timeText, isOvertime && styles.timeOvertime]}>{displayTime}</Text>

      {canControl && (
        <View style={styles.controls}>
          {timerState?.isRunning ? (
            <TouchableOpacity style={styles.ctrlBtn} onPress={handlePause}>
              <Pause size={16} color="white" />
              <Text style={styles.ctrlText}>Pausar</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={[styles.ctrlBtn, styles.ctrlPrimary]} onPress={handleStart}>
              <Play size={16} color="white" />
              <Text style={styles.ctrlText}>Iniciar</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.ctrlBtn} onPress={handleReset}>
            <RotateCcw size={16} color="white" />
            <Text style={styles.ctrlText}>Reiniciar</Text>
          </TouchableOpacity>
        </View>
      )}
    </GlassPanel>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', padding: 16 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  title: { color: colors.textMuted, fontSize: 12, textTransform: 'uppercase', fontWeight: 'bold' },
  timeText: { fontSize: 40, fontWeight: '900', color: 'white', fontVariant: ['tabular-nums'] },
  timeOvertime: { color: colors.danger },
  controls: { flexDirection: 'row', gap: 10, marginTop: 14 },
  ctrlBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  ctrlPrimary: { backgroundColor: colors.primary, borderColor: colors.primaryHover },
  ctrlText: { color: 'white', fontWeight: '600', fontSize: 14 },
});
