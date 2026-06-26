import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator, StyleSheet, KeyboardAvoidingView, Platform, Modal, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRoomSync } from '../../src/hooks/useRoomSync';
import { getDefaultStages } from '../../src/utils/defaultStages';
import { globalStyles, colors } from '../../src/theme/GlobalStyles';

import Header from '../../src/components/Header';
import GlassPanel from '../../src/components/GlassPanel';
import PipelinePanel from '../../src/components/PipelinePanel';
import BuyerPersonaPanel from '../../src/components/BuyerPersonaPanel';
import RolesPanel from '../../src/components/RolesPanel';
import ProductPanel from '../../src/components/ProductPanel';
import Timer from '../../src/components/Timer';
import PrivateInfoModal from '../../src/components/PrivateInfoModal';
import SurpriseEventButton from '../../src/components/SurpriseEventButton';
import VotingPanel from '../../src/components/VotingPanel';
import DebriefPanel from '../../src/components/DebriefPanel';
import SettingsModal from '../../src/components/SettingsModal';

export default function RoomScreen() {
  const { t, i18n } = useTranslation();
  const { id: roomId } = useLocalSearchParams();
  const router = useRouter();
  
  const { roomData, loading, updateScenario, updateTimer, updateActiveStage, updateQuestions, updateDebriefNotes, triggerSurpriseEvent, updateProductPresentation } = useRoomSync(roomId);

  const [sessionTitle, setSessionTitle] = useState(t('lobby.title', 'Simulación de Ventas'));
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [apiUrl, setApiUrl] = useState('/api/nvidia/v1/chat/completions');
  const [apiModel, setApiModel] = useState('meta/llama-3.1-8b-instruct');
  const [participants, setParticipants] = useState([]);
  const [stages, setStages] = useState(() => getDefaultStages(i18n.language));
  
  const [showPrivateInfo, setShowPrivateInfo] = useState(false);
  
  const [showSurpriseEvent, setShowSurpriseEvent] = useState(false);
  const [seenSurpriseEventId, setSeenSurpriseEventId] = useState(null);

  const [role, setRole] = useState('Observador');
  const [userName, setUserName] = useState('Anónimo');

  useEffect(() => {
    const loadData = async () => {
      const savedName = await AsyncStorage.getItem('sales_arena_userName');
      if (!savedName) {
        router.replace('/');
        return;
      }
      setUserName(savedName);
      setRole(await AsyncStorage.getItem('sales_arena_role') || 'Observador');
      
      const savedKey = await AsyncStorage.getItem('nvidia_api_key');
      if (savedKey) setApiKey(savedKey);
      
      const savedUrl = await AsyncStorage.getItem('api_url');
      if (savedUrl) setApiUrl(savedUrl);
      
      const savedModel = await AsyncStorage.getItem('api_model');
      if (savedModel) setApiModel(savedModel);
      
      const savedTitle = await AsyncStorage.getItem('session_title');
      if (savedTitle) setSessionTitle(savedTitle);

      const savedStages = await AsyncStorage.getItem('pipeline_stages');
      if (savedStages) {
        try {
          const parsed = JSON.parse(savedStages);
          if (Array.isArray(parsed)) setStages(parsed);
        } catch (e) {}
      }
    };
    loadData();
  }, [router]);

  useEffect(() => {
    if (roomData?.surpriseEvent && roomData.surpriseEvent.id !== seenSurpriseEventId) {
      setShowSurpriseEvent(true);
    }
  }, [roomData?.surpriseEvent, seenSurpriseEventId]);

  if (loading || !roomData) {
    return (
      <View style={[globalStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ color: 'white', marginTop: 10 }}>{t('room.syncing', {roomId})}</Text>
      </View>
    );
  }

  const { currentScenario, activeStageIndex, timerState } = roomData;

  const isFacilitator = role === 'Facilitador';
  const isCloser = role === 'Closer';
  const isLead = role === 'Lead';
  const isObserver = role === 'Observador';

  return (
    <KeyboardAvoidingView style={globalStyles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <Header 
          title={sessionTitle}
          roomId={roomId}
          role={role}
          onTitleChange={isFacilitator ? async (newTitle) => {
            setSessionTitle(newTitle);
            await AsyncStorage.setItem('session_title', newTitle);
          } : undefined}
          onOpenSettings={isFacilitator ? () => setShowSettings(true) : undefined}
        />

        <View style={styles.stack}>
          {!isLead && !isObserver && (
            <PipelinePanel 
              activeStageIndex={activeStageIndex || 0} 
              stages={stages} 
            />
          )}

          {/* Stacking panels vertically for mobile */}
          {(isFacilitator || isLead || isObserver) && (
            <BuyerPersonaPanel 
              currentScenario={currentScenario}
              setCurrentScenario={async (s) => {
                await updateScenario(s);
                if (s.productToSell) await updateProductPresentation(s.productToSell);
              }}
              stages={stages}
              isFacilitator={isFacilitator}
            />
          )}

          {isObserver && stages[activeStageIndex || 0] && (
            <View style={styles.observerHighlight}>
              <Text style={styles.highlightTitle}>Camino del Closer (Etapa {activeStageIndex + 1})</Text>
              <Text style={styles.highlightStage}>{stages[activeStageIndex || 0].label}</Text>
              <Text style={styles.highlightObj}>{stages[activeStageIndex || 0].objective}</Text>
            </View>
          )}

          {isFacilitator && (
            <RolesPanel participants={participants} />
          )}

          {!isLead && (
            <Timer timerState={timerState} activeStageIndex={activeStageIndex || 0} stages={stages} />
          )}

          {(isFacilitator || isCloser) && (
            <ProductPanel productPresentation={roomData.productPresentation} />
          )}

          {(isFacilitator || isLead) && (
            <View style={styles.actionRow}>
              <TouchableOpacity 
                style={[globalStyles.btn, globalStyles.btnOutline]} 
                onPress={() => setShowPrivateInfo(true)}
              >
                <Text style={globalStyles.btnText}>Ver Info Privada</Text>
              </TouchableOpacity>
              {isFacilitator && (
                <SurpriseEventButton 
                  currentScenario={currentScenario} 
                  triggerSurpriseEvent={triggerSurpriseEvent} 
                />
              )}
            </View>
          )}

          {(isFacilitator || isObserver) && (
            <DebriefPanel 
              roomNotes={roomData.debriefNotes} 
              updateDebriefNotes={updateDebriefNotes}
              isObserver={isObserver}
              isFacilitator={isFacilitator}
            />
          )}

          {isFacilitator && (
            <VotingPanel 
              questions={roomData.questions} 
              updateQuestions={updateQuestions}
              activeStage={stages[activeStageIndex || 0]}
              isFacilitator={isFacilitator}
              isObserver={isObserver}
            />
          )}
          
        </View>
      </ScrollView>

      <SettingsModal 
        visible={showSettings} 
        onClose={() => setShowSettings(false)} 
      />

      <PrivateInfoModal 
        visible={showPrivateInfo} 
        onClose={() => setShowPrivateInfo(false)} 
        info={currentScenario?.hiddenContext} 
      />

      <Modal visible={showSurpriseEvent} animationType="fade" transparent={true}>
        <View style={{flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', padding: 20}}>
          <GlassPanel style={{borderColor: colors.accent, borderWidth: 2}}>
            <Text style={{color: colors.accent, fontSize: 24, fontWeight: 'bold', marginBottom: 16, textAlign: 'center'}}>
              ⚡ ¡EVENTO SORPRESA!
            </Text>
            <Text style={{color: 'white', fontSize: 18, lineHeight: 26, textAlign: 'center', marginBottom: 24}}>
              {roomData?.surpriseEvent?.text}
            </Text>
            <TouchableOpacity 
              style={[globalStyles.btn, {backgroundColor: colors.accent}]} 
              onPress={() => {
                setShowSurpriseEvent(false);
                setSeenSurpriseEventId(roomData?.surpriseEvent?.id);
              }}
            >
              <Text style={[globalStyles.btnText, {color: 'black'}]}>Entendido</Text>
            </TouchableOpacity>
          </GlassPanel>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },
  stack: {
    gap: 16,
    paddingBottom: 40,
    marginTop: 10,
  },
  observerHighlight: {
    backgroundColor: 'rgba(24, 24, 27, 0.8)',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  highlightTitle: {
    fontSize: 12,
    color: colors.textMuted,
    textTransform: 'uppercase',
    fontWeight: 'bold',
  },
  highlightStage: {
    color: colors.primary,
    fontWeight: 'bold',
    fontSize: 18,
    marginVertical: 4,
  },
  highlightObj: {
    color: colors.textMain,
    fontSize: 14,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
  }
});
