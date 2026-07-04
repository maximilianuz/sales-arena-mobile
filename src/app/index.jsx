import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Shuffle, Copy, BookOpen, Trophy, Target } from 'lucide-react-native';
import { colors, globalStyles } from '../theme/GlobalStyles';
import GlassPanel from '../components/GlassPanel';
import LevelCard from '../components/LevelCard';
import ProgressPath from '../components/ProgressPath';


export default function LobbyScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [roomId, setRoomId] = useState('');

  const roles = [
    { id: 'Facilitador', label: t('lobby.roles.Facilitador', 'Facilitador'), desc: t('lobby.roles.FacilitadorDesc', 'Controla la IA') },
    { id: 'Closer', label: t('lobby.roles.Closer', 'Closer'), desc: t('lobby.roles.CloserDesc', 'El vendedor') },
    { id: 'Lead', label: t('lobby.roles.Lead', 'Lead'), desc: t('lobby.roles.LeadDesc', 'El prospecto') },
    { id: 'Observador', label: t('lobby.roles.Observador', 'Observador'), desc: t('lobby.roles.ObservadorDesc', 'Analiza la llamada') }
  ];

  const getRoleColor = (roleId) => {
    switch(roleId) {
      case 'Facilitador': return colors.primary;
      case 'Closer': return colors.success;
      case 'Lead': return colors.accent;
      case 'Observador': return colors.secondary;
      default: return colors.primary;
    }
  };

  const handleJoin = async () => {
    if (!name || !role || !roomId) return;
    
    await AsyncStorage.setItem('sales_arena_userName', name);
    await AsyncStorage.setItem('sales_arena_role', role);
    await AsyncStorage.setItem('sales_arena_roomId', roomId);

    router.push(`/room/${roomId}`);
  };

  const generateRoomId = () => {
    const newId = `sala-${Math.floor(Math.random() * 90000) + 10000}`;
    setRoomId(newId);
  };

  const copyRoomId = async () => {
    if (!roomId) return;
    // We can't rely on expo-clipboard without installing it, so we'll just show an alert for now
    Alert.alert('Funcionalidad', 'Por favor instala expo-clipboard para copiar');
  };

  return (
    <KeyboardAvoidingView 
      style={globalStyles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <GlassPanel style={styles.mainPanel}>
          <View style={styles.header}>
            <Text style={styles.title}>Sales Arena</Text>
            <Text style={styles.subtitle}>AI-Powered Simulator</Text>
          </View>

          <LevelCard />

          {/* Camino del Closer (progresión Novato→Pro) */}
          <ProgressPath />

          {/* Práctica solo contra el comprador IA */}
          <TouchableOpacity style={styles.soloBtn} onPress={() => router.push('/solo')}>
            <Target size={16} color={colors.success} />
            <Text style={styles.soloBtnText}>{i18n.language?.startsWith('en') ? 'Practice solo — AI Buyer' : 'Practicar solo — Comprador IA'}</Text>
          </TouchableOpacity>

          {/* Ranking mundial + torneo mensual */}
          <TouchableOpacity style={styles.leaderboardBtn} onPress={() => router.push('/leaderboard')}>
            <Trophy size={16} color={colors.accent} />
            <Text style={styles.leaderboardBtnText}>
              {t('lobby.leaderboard', i18n.language?.startsWith('en') ? 'Leaderboard' : 'Tabla de posiciones')}
            </Text>
          </TouchableOpacity>

          <View style={styles.formGroup}>
            <Text style={styles.label}>{t('lobby.yourName', 'Tu nombre')}</Text>
            <TextInput 
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholderTextColor={colors.textMuted}
              placeholder={t('lobby.namePlaceholder', 'Ej. Carlos')}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>{t('lobby.roomId', 'ID de la Sala')}</Text>
            <View style={styles.row}>
              <TextInput 
                style={[styles.input, { flex: 1 }]}
                value={roomId}
                onChangeText={setRoomId}
                placeholderTextColor={colors.textMuted}
                placeholder={t('lobby.roomIdPlaceholder', 'Ej. sala-1234')}
              />
              <TouchableOpacity style={styles.iconBtn} onPress={generateRoomId}>
                <Shuffle size={20} color={colors.textMain} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconBtn} onPress={copyRoomId} disabled={!roomId}>
                <Copy size={20} color={roomId ? colors.textMain : colors.textMuted} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>{t('lobby.chooseRole', 'Selecciona tu rol')}</Text>
            <View style={styles.rolesGrid}>
              {roles.map(r => {
                const roleColor = getRoleColor(r.id);
                const isActive = role === r.id;
                return (
                  <TouchableOpacity 
                    key={r.id}
                    onPress={() => setRole(r.id)}
                    style={[
                      styles.roleCard,
                      { borderColor: isActive ? roleColor : colors.glassBorder },
                      isActive && { backgroundColor: `${roleColor}33` }
                    ]}
                  >
                    <Text style={[styles.roleLabel, { color: isActive ? 'white' : colors.textMain }]}>{r.label}</Text>
                    <Text style={styles.roleDesc}>{r.desc}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <TouchableOpacity 
            style={[globalStyles.btn, globalStyles.btnPrimary, { marginTop: 10, opacity: (!name || !role || !roomId) ? 0.5 : 1 }]}
            onPress={handleJoin}
            disabled={!name || !role || !roomId}
          >
            <Text style={globalStyles.btnText}>{t('lobby.continue', 'Continuar')}</Text>
          </TouchableOpacity>
        </GlassPanel>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  mainPanel: {
    maxWidth: 500,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 40,
    fontWeight: '800',
    color: 'white',
    letterSpacing: -0.5,
  },
  subtitle: {
    color: colors.textMuted,
    marginTop: 5,
    letterSpacing: 2,
    textTransform: 'uppercase',
    fontSize: 12,
    fontWeight: '600',
  },
  formGroup: {
    marginBottom: 24,
  },
  label: {
    color: colors.textMuted,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    borderWidth: 1,
    borderColor: colors.glassBorder,
    color: 'white',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  iconBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: 12,
    width: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rolesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  roleCard: {
    flexBasis: '48%',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  roleLabel: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  roleDesc: {
    fontSize: 12,
    color: colors.textMuted,
  },
  leaderboardBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 12, borderRadius: 12, marginBottom: 24,
    backgroundColor: 'rgba(245,158,11,0.08)', borderWidth: 1, borderColor: 'rgba(245,158,11,0.35)',
  },
  leaderboardBtnText: {
    color: colors.accent, fontWeight: '700', fontSize: 14,
  },
  soloBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 12, borderRadius: 12, marginBottom: 16,
    backgroundColor: 'rgba(16,185,129,0.08)', borderWidth: 1, borderColor: 'rgba(16,185,129,0.35)',
  },
  soloBtnText: {
    color: colors.success, fontWeight: '700', fontSize: 14,
  },
});
