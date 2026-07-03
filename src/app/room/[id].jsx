import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator, StyleSheet, KeyboardAvoidingView, Platform, Modal, TouchableOpacity, Linking } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRoomSync } from '../../hooks/useRoomSync';
import { auth } from '../../utils/db';
import { getDefaultStages } from '../../utils/defaultStages';
import { globalStyles, colors } from '../../theme/GlobalStyles';
import { useSubscriptionContext } from '../../contexts/SubscriptionContext';

import Header from '../../components/Header';
import GlassPanel from '../../components/GlassPanel';
import PipelinePanel from '../../components/PipelinePanel';
import BuyerPersonaPanel from '../../components/BuyerPersonaPanel';
import RolesPanel from '../../components/RolesPanel';
import ProductPanel from '../../components/ProductPanel';
import Timer from '../../components/Timer';
import PrivateInfoModal from '../../components/PrivateInfoModal';
import SurpriseEventButton from '../../components/SurpriseEventButton';
import VotingPanel from '../../components/VotingPanel';
import DebriefPanel from '../../components/DebriefPanel';
import SettingsModal from '../../components/SettingsModal';
import UpgradeModal from '../../components/UpgradeModal';
import LeadCheckoutPanel from '../../components/LeadCheckoutPanel';
import CheckoutResultBanner from '../../components/CheckoutResultBanner';
import CloserCommandPanel from '../../components/CloserCommandPanel';
import RubricPanel from '../../components/RubricPanel';

const WEB_APP_URL = 'https://sales-arena.netlify.app';

export default function RoomScreen() {
  const { t, i18n } = useTranslation();
  const { id: roomId } = useLocalSearchParams();
  const router = useRouter();
  
  const { roomData, loading, updateScenario, updateTimer, updateActiveStage, updateQuestions, updateDebriefNotes, triggerSurpriseEvent, updateProductPresentation, enableCheckout, updateCheckoutPhase, updateRubric, updateConfig, registerCloser } = useRoomSync(roomId);
  const { isFree } = useSubscriptionContext() || { isFree: false };
  const [upgradeModal, setUpgradeModal] = useState(null);

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

  // Registrar quién actúa de Closer para acreditarle a ÉL la comisión al analizar.
  useEffect(() => {
    if (role === 'Closer' && roomData && auth.currentUser && roomData.closerUid !== auth.currentUser.uid) {
      registerCloser(auth.currentUser.uid, userName);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, roomData, userName]);

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

  // Cambio de etapa: además de mover el índice, reseteamos el cronómetro al
  // tiempo configurado de esa etapa (igual que la web).
  const handleStageChange = (idx) => {
    updateActiveStage(idx);
    const est = parseInt(stages[idx]?.estimatedTime, 10) || 5;
    updateTimer({ isRunning: false, endTimestamp: null, timeLeft: est * 60 });
  };

  // Info privada = la causa REAL detrás de la objeción (para Trainer y para
  // quien actúa de Lead). El escenario no tiene "hiddenContext"; lo armamos con
  // la objeción oculta + la guía de roleplay.
  const g = currentScenario?.roleplayGuide || {};
  const privateInfo = currentScenario ? [
    currentScenario.hiddenObjection && `OBJECIÓN OCULTA (la causa real):\n${currentScenario.hiddenObjection}`,
    g.moneyBelief && `Creencia limitante sobre el dinero:\n${g.moneyBelief}`,
    g.competingGoal && `Conflicto interno:\n${g.competingGoal}`,
    g.vendorFatigue && `Por qué desconfía de vendedores:\n${g.vendorFatigue}`,
    g.actorAdvice && `Cómo actuar a este Lead:\n${g.actorAdvice}`,
  ].filter(Boolean).join('\n\n') : '';

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
          {roomData.checkout?.result && <CheckoutResultBanner checkout={roomData.checkout} />}

          {!isLead && !isObserver && (
            <PipelinePanel
              activeStageIndex={activeStageIndex || 0}
              setActiveStageIndex={isFacilitator ? handleStageChange : undefined}
              stages={stages}
              pipelineQuestions={currentScenario?.pipelineQuestions}
              isFree={isFree}
              onUpgradeStage={() => setUpgradeModal({ feature: 'Cualificación y Cierre', requiredPlan: 'closer' })}
              showDetail={!isCloser}
            />
          )}

          {/* Centro de comando del Closer: misión + coach de etapa + preguntas + intel */}
          {isCloser && (
            <CloserCommandPanel
              currentScenario={currentScenario}
              activeStage={stages[activeStageIndex || 0]}
              pipelineQuestions={currentScenario?.pipelineQuestions}
              productPresentation={roomData.productPresentation}
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
              roomConfig={roomData.config}
            />
          )}

          {isLead && currentScenario && (
            <LeadCheckoutPanel
              checkout={roomData.checkout}
              updateCheckoutPhase={updateCheckoutPhase}
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
            <RolesPanel participants={participants} setParticipants={setParticipants} />
          )}

          {!isLead && (
            <Timer
              timerState={timerState}
              activeStageIndex={activeStageIndex || 0}
              stages={stages}
              updateTimer={isFacilitator ? updateTimer : undefined}
              maxMinutes={isFree ? 30 : null}
            />
          )}

          {/* El Closer ya tiene el producto (colapsable) dentro de su centro de comando */}
          {isFacilitator && (
            <ProductPanel productPresentation={roomData.productPresentation} />
          )}

          {isFacilitator && currentScenario && (
            <GlassPanel>
              <Text style={styles.checkoutTitle}>Fase de Cierre (checkout del Lead)</Text>
              {roomData.checkout?.enabled ? (
                <Text style={styles.checkoutStatus}>
                  ✅ Habilitada — el Lead ya puede iniciar el checkout simulado.
                </Text>
              ) : (
                <TouchableOpacity
                  style={[globalStyles.btn, globalStyles.btnPrimary]}
                  onPress={enableCheckout}
                >
                  <Text style={globalStyles.btnText}>Habilitar fase de Cierre</Text>
                </TouchableOpacity>
              )}
            </GlassPanel>
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

          {(isFacilitator || isObserver) && currentScenario && (
            <RubricPanel
              rubric={roomData.rubric}
              updateRubric={updateRubric}
              canScore={isObserver || isFacilitator}
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
        roomConfig={roomData.config}
        onSaveConfig={updateConfig}
      />

      <PrivateInfoModal
        visible={showPrivateInfo}
        onClose={() => setShowPrivateInfo(false)}
        info={privateInfo}
      />

      <UpgradeModal
        visible={!!upgradeModal}
        feature={upgradeModal?.feature}
        requiredPlan={upgradeModal?.requiredPlan}
        onClose={() => setUpgradeModal(null)}
        onUpgrade={() => { Linking.openURL(WEB_APP_URL); setUpgradeModal(null); }}
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
  },
  checkoutTitle: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 12,
  },
  checkoutStatus: {
    color: colors.success,
    fontSize: 14,
    lineHeight: 20,
  },
});
