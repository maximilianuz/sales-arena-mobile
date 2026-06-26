import { StyleSheet } from 'react-native';

export const colors = {
  primary: '#6366f1',
  primaryHover: '#4f46e5',
  primaryGlow: 'rgba(99, 102, 241, 0.4)',
  
  secondary: '#ec4899',
  secondaryHover: '#db2777',
  secondaryGlow: 'rgba(236, 72, 153, 0.4)',
  
  accent: '#f59e0b',
  success: '#10b981',
  successGlow: 'rgba(16, 185, 129, 0.3)',
  danger: '#ef4444',
  
  bgDark: '#09090b',
  bgCard: 'rgba(24, 24, 27, 0.65)',
  
  textMain: '#f8fafc',
  textMuted: '#94a3b8',
  
  glassBorder: 'rgba(255, 255, 255, 0.08)',
  glassBorderHighlight: 'rgba(255, 255, 255, 0.15)',
};

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgDark,
  },
  glassPanel: {
    backgroundColor: colors.bgCard,
    borderColor: colors.glassBorder,
    borderWidth: 1,
    borderTopColor: colors.glassBorderHighlight,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  textMain: {
    color: colors.textMain,
    fontFamily: 'System', // Outfit can be loaded later
  },
  textMuted: {
    color: colors.textMuted,
  },
  btn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  btnPrimary: {
    backgroundColor: colors.primary,
  },
  btnSecondary: {
    backgroundColor: colors.secondary,
  },
  btnOutline: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderColor: colors.glassBorder,
    borderWidth: 1,
  },
  btnText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 15,
    letterSpacing: 0.5,
  }
});
