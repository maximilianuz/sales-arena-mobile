import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Clock } from 'lucide-react-native';
import { globalStyles, colors } from '../theme/GlobalStyles';
import GlassPanel from './GlassPanel';

export default function Timer({ timerState, activeStageIndex, stages }) {
  const [displayTime, setDisplayTime] = useState('00:00');
  const [isOvertime, setIsOvertime] = useState(false);

  useEffect(() => {
    let intervalId;
    
    const updateTimer = () => {
      if (!timerState) return;
      
      let secondsLeft = 0;
      if (timerState.isRunning && timerState.endTimestamp) {
        const now = Date.now();
        secondsLeft = Math.round((timerState.endTimestamp - now) / 1000);
      } else {
        secondsLeft = timerState.timeLeft || 0;
      }
      
      setIsOvertime(secondsLeft < 0);
      const absSeconds = Math.abs(secondsLeft);
      
      const mins = Math.floor(absSeconds / 60);
      const secs = absSeconds % 60;
      setDisplayTime(`${isOvertime ? '-' : ''}${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
    };

    updateTimer();
    
    if (timerState?.isRunning) {
      intervalId = setInterval(updateTimer, 1000);
    }
    
    return () => clearInterval(intervalId);
  }, [timerState, isOvertime]);

  if (!timerState) return null;

  return (
    <GlassPanel style={styles.container}>
      <View style={styles.header}>
        <Clock size={16} color={colors.textMuted} />
        <Text style={styles.title}>Tiempo de la Etapa</Text>
      </View>
      <Text style={[styles.timeText, isOvertime && styles.timeOvertime]}>
        {displayTime}
      </Text>
    </GlassPanel>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  title: {
    color: colors.textMuted,
    fontSize: 12,
    textTransform: 'uppercase',
    fontWeight: 'bold',
  },
  timeText: {
    fontSize: 40,
    fontWeight: '900',
    color: 'white',
    fontVariant: ['tabular-nums'],
  },
  timeOvertime: {
    color: colors.danger,
  }
});
