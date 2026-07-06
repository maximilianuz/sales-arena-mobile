import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { BarChart2, RotateCcw, Plus } from 'lucide-react-native';
import { globalStyles, colors } from '../theme/GlobalStyles';
import GlassPanel from './GlassPanel';

// Las salas creadas desde la web guardan colores como CSS vars ("var(--success)")
// que React Native no entiende. Los resolvemos a hex acá para que las barras se
// vean bien en móvil sin importar quién creó la sala.
const CSS_VAR_HEX = {
  'var(--success)': colors.success,
  'var(--danger)': colors.danger,
  'var(--secondary)': colors.secondary,
  'var(--primary)': colors.primary,
  'var(--accent)': colors.accent,
};
const resolveColor = (c) => {
  if (!c) return colors.primary;
  if (CSS_VAR_HEX[c]) return CSS_VAR_HEX[c];
  if (typeof c === 'string' && c.startsWith('var(')) return colors.primary;
  return c;
};

export default function VotingPanel({ isObserver, isFacilitator, questions = [], updateQuestions, activeStage }) {
  const INITIAL_QUESTIONS = [
    { id: 1, question: "¿Encontró la objeción real?", options: [{ text: "Sí", votes: 0, color: colors.success }, { text: "No", votes: 0, color: colors.danger }] },
    { id: 2, question: "¿Quién tuvo el control?", options: [{ text: "Cliente", votes: 0, color: colors.secondary }, { text: "Vendedor", votes: 0, color: colors.primary }] },
    { id: 3, question: "¿Qué faltó?", options: [{ text: "Más preguntas", votes: 0, color: colors.accent }, { text: "Mejor escucha", votes: 0, color: "#8B5CF6" }, { text: "Mejor cierre", votes: 0, color: "#06B6D4" }] }
  ];

  const addVote = (qIndex, oIndex) => {
    if (!updateQuestions) return;
    const newQuestions = JSON.parse(JSON.stringify(questions)); // Deep copy
    newQuestions[qIndex].options[oIndex].votes += 1;
    updateQuestions(newQuestions);
  };

  const handleReset = () => {
    if (!updateQuestions) return;
    updateQuestions(INITIAL_QUESTIONS);
  };

  if (!questions || questions.length === 0) return null;

  return (
    <GlassPanel>
      <View style={styles.header}>
        <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
          <BarChart2 size={16} color={colors.textMain} />
          <Text style={styles.title}>Evaluación Grupal</Text>
        </View>
        {isFacilitator && (
          <TouchableOpacity style={[globalStyles.btn, globalStyles.btnOutline, {paddingVertical: 4, paddingHorizontal: 8}]} onPress={handleReset}>
            <RotateCcw size={12} color="white" style={{marginRight: 4}} />
            <Text style={[globalStyles.btnText, {fontSize: 12}]}>Reset</Text>
          </TouchableOpacity>
        )}
      </View>

      {activeStage && (
        <View style={styles.focusBox}>
          <Text style={styles.focusTitle}>Foco: {activeStage.label}</Text>
          <Text style={styles.focusIndicator}>{activeStage.indicator}</Text>
        </View>
      )}

      <View style={styles.content}>
        {questions.map((q, qIndex) => {
          const totalVotes = q.options.reduce((acc, curr) => acc + (curr.votes || 0), 0);

          return (
            <View key={q.id} style={styles.questionBlock}>
              <Text style={styles.questionText}>{q.question}</Text>
              <View style={{ gap: 8 }}>
                {q.options.map((opt, oIndex) => {
                  const percentage = totalVotes === 0 ? 0 : Math.round(((opt.votes || 0) / totalVotes) * 100);
                  
                  return (
                    <View key={oIndex} style={styles.optRow}>
                      {(isObserver || isFacilitator) && updateQuestions && (
                        <TouchableOpacity 
                          style={styles.addBtn}
                          onPress={() => addVote(qIndex, oIndex)}
                        >
                          <Plus size={16} color="white" />
                        </TouchableOpacity>
                      )}
                      
                      <View style={styles.barContainer}>
                        <View style={[styles.barFill, { width: `${percentage}%`, backgroundColor: resolveColor(opt.color) }]} />
                        <View style={styles.barLabels}>
                          <Text style={styles.barText}>{opt.text}</Text>
                          <Text style={styles.barText}>{opt.votes || 0} ({percentage}%)</Text>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          );
        })}
      </View>
    </GlassPanel>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  title: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  focusBox: {
    backgroundColor: 'rgba(94, 92, 230, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(94, 92, 230, 0.3)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  focusTitle: {
    color: colors.primary,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  focusIndicator: {
    color: colors.primary,
    fontSize: 12,
  },
  content: {
    gap: 16,
  },
  questionBlock: {
    marginBottom: 8,
  },
  questionText: {
    color: 'white',
    marginBottom: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  optRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  barContainer: {
    flex: 1,
    height: 32,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 6,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  barFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
  },
  barLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  barText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  }
});
