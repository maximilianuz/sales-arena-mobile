import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { Settings, User, Copy } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { globalStyles, colors } from '../theme/GlobalStyles';

export default function Header({ title, roomId, role, onTitleChange, onOpenSettings }) {
  const { t } = useTranslation();

  return (
    <View style={styles.header}>
      <View style={styles.topRow}>
        {onTitleChange ? (
          <TextInput 
            style={styles.titleInput}
            value={title}
            onChangeText={onTitleChange}
            placeholder="Título"
            placeholderTextColor={colors.textMuted}
          />
        ) : (
          <Text style={styles.title}>{title}</Text>
        )}
        
        {onOpenSettings && (
          <TouchableOpacity onPress={onOpenSettings} style={styles.iconBtn}>
            <Settings size={20} color={colors.textMain} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.bottomRow}>
        {role && (
          <View style={styles.badge}>
            <User size={14} color={colors.textMuted} />
            <Text style={styles.badgeText}>{role}</Text>
          </View>
        )}
        {roomId && (
          <View style={styles.badge}>
            <Copy size={14} color={colors.textMuted} />
            <Text style={styles.badgeText}>{roomId}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 20,
    backgroundColor: 'rgba(255,255,255,0.02)',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: 'white',
  },
  titleInput: {
    fontSize: 22,
    fontWeight: '800',
    color: 'white',
    flex: 1,
    padding: 0,
  },
  iconBtn: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
  },
  bottomRow: {
    flexDirection: 'row',
    gap: 10,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  badgeText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  }
});
