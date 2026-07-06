import { StyleSheet } from 'react-native';

// Paleta "Apple" — espejo de la web (src/index.css). Índigo/azul/rosa/verde/
// naranja/rojo del sistema iOS. Mantener sincronizada con la web.
export const colors = {
  primary: '#5e5ce6',        // systemIndigo
  primaryHover: '#4a47d0',
  primaryGlow: 'rgba(94, 92, 230, 0.4)',

  blue: '#0a84ff',           // systemBlue (acento de marca)

  secondary: '#ff375f',      // systemPink
  secondaryHover: '#e02a50',
  secondaryGlow: 'rgba(255, 55, 95, 0.4)',

  accent: '#ff9f0a',         // systemOrange
  success: '#30d158',        // systemGreen
  successGlow: 'rgba(48, 209, 88, 0.3)',
  danger: '#ff453a',         // systemRed

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
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  textMain: {
    color: colors.textMain,
    fontFamily: 'System',
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
