import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Alert,
  Modal, TextInput, Pressable, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useSettingsStore from '../../store/settingsStore';
import useChatStore from '../../store/chatStore';
import useMemoryStore from '../../store/memoryStore';
import SettingItem from '../../components/SettingItem';
import MemoryCard from '../../components/MemoryCard';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import { DEFAULT_PERSONALITY } from '../../constants/config';

function EditModal({ visible, title, value, onSave, onClose, placeholder, hint, multiline }) {
  const [text, setText] = useState(value || '');

  React.useEffect(() => {
    if (visible) setText(value || '');
  }, [visible, value]);

  const handleSave = () => { onSave(text.trim()); onClose(); };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <Pressable style={styles.modalCard}>
            <Text style={styles.modalTitle}>{title}</Text>
            {hint ? <Text style={styles.modalHint}>{hint}</Text> : null}
            <TextInput
              style={[styles.modalInput, multiline && styles.modalInputMulti]}
              value={text}
              onChangeText={setText}
              placeholder={placeholder}
              placeholderTextColor={COLORS.textMuted}
              autoCapitalize="none"
              autoCorrect={false}
              autoFocus
              multiline={multiline}
              numberOfLines={multiline ? 6 : 1}
            />
            <View style={styles.modalActions}>
              <Pressable style={styles.cancelBtn} onPress={onClose}>
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.saveBtn} onPress={handleSave}>
                <Text style={styles.saveText}>Save</Text>
              </Pressable>
            </View>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}

export default function SettingScreen() {
  const {
    aiName, userName, memoryEnabled, personalityPrompt,
    setAiName, setUserName, setMemoryEnabled, setPersonalityPrompt,
  } = useSettingsStore();

  const { messages } = useChatStore();
  const { longTermMemory, clearMemory, isSummarizing } = useMemoryStore();
  const [modal, setModal] = useState(null);

  const openModal = (config) => setModal(config);
  const closeModal = () => setModal(null);

  const handleSave = async (value) => {
    if (!modal) return;
    const actions = {
      aiName: setAiName,
      userName: setUserName,
      personality: setPersonalityPrompt,
    };
    await actions[modal.type]?.(value);
  };

  const handleClearMemory = () => {
    Alert.alert(
      'Clear Memory',
      "This will erase everything Chatty has learned about you. This can't be undone.",
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear Memory', style: 'destructive', onPress: clearMemory },
      ]
    );
  };

  const handleClearChat = () => {
    Alert.alert('Clear Current Chat', 'This will permanently delete the current conversation.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: () => useChatStore.getState().clearChat() },
    ]);
  };

  const personalityPreview = personalityPrompt.length > 50
    ? personalityPrompt.slice(0, 50) + '…'
    : personalityPrompt;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
        </View>

        {/* ── Personalization ── */}
        <Section label="Personalization">
          <SettingItem
            icon="sparkles-outline"
            label="AI Name"
            value={aiName}
            onPress={() => openModal({ type: 'aiName', title: 'AI Name', value: aiName, placeholder: 'Chatty' })}
          />
          <Divider />
          <SettingItem
            icon="person-outline"
            label="Your Name"
            value={userName}
            onPress={() => openModal({ type: 'userName', title: 'Your Name', value: userName, placeholder: 'You' })}
          />
          <Divider />
          <SettingItem
            icon="chatbox-ellipses-outline"
            label="Personality Prompt"
            value={personalityPreview}
            onPress={() => openModal({
              type: 'personality',
              title: 'Personality Prompt',
              value: personalityPrompt,
              placeholder: DEFAULT_PERSONALITY,
              hint: 'Describe how Chatty should behave and speak.',
              multiline: true,
            })}
          />
        </Section>

        {/* ── Memory ── */}
        <Section label="Memory">
          <View style={styles.card}>
            <SettingItem
              icon="sparkles-outline"
              label="Long-term Memory"
              value={isSummarizing ? 'Updating…' : memoryEnabled ? 'Enabled' : 'Disabled'}
              type="switch"
              switchValue={memoryEnabled}
              onSwitchChange={setMemoryEnabled}
            />
            <Divider />
            <MemoryCard memory={longTermMemory} />
            <Divider />
            <SettingItem
              icon="trash-outline"
              label="Clear Memory"
              value="Erase what Chatty knows"
              onPress={handleClearMemory}
              danger
            />
          </View>
        </Section>

        {/* ── Data ── */}
        <Section label="Data">
          <SettingItem
            icon="chatbubble-outline"
            label="Clear Current Chat"
            value={`${messages.length} messages`}
            onPress={handleClearChat}
            danger
          />
        </Section>

        {/* ── About ── */}
        <View style={styles.section}>
          <View style={styles.aboutCard}>
            <Text style={styles.aboutTitle}>✦ Chatty</Text>
            <Text style={styles.aboutVersion}>Version 1.1.0</Text>
            <Text style={styles.aboutText}>Your warm, thoughtful AI companion </Text>
          </View>
        </View>
      </ScrollView>

      {modal && (
        <EditModal
          visible={true}
          title={modal.title}
          value={modal.value}
          placeholder={modal.placeholder}
          hint={modal.hint}
          multiline={modal.multiline}
          onSave={handleSave}
          onClose={closeModal}
        />
      )}
    </SafeAreaView>
  );
}

function Section({ label, children }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>{label}</Text>
      <View style={styles.card}>{children}</View>
    </View>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingHorizontal: SPACING.base, paddingTop: SPACING.sm, paddingBottom: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.borderLight },
  title: { fontSize: FONTS.sizes.xl, fontWeight: FONTS.weights.bold, color: COLORS.text },
  section: { marginTop: SPACING.lg, paddingHorizontal: SPACING.base },
  sectionLabel: { fontSize: FONTS.sizes.xs, fontWeight: FONTS.weights.semibold, color: COLORS.textMuted, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: SPACING.sm, marginLeft: SPACING.xs },
  card: { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.borderLight, overflow: 'hidden', ...SHADOWS.soft },
  divider: { height: 1, backgroundColor: COLORS.borderLight, marginLeft: SPACING.base },
  aboutCard: { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.borderLight, padding: SPACING.lg, alignItems: 'center', marginBottom: SPACING.xxl, ...SHADOWS.soft },
  aboutTitle: { fontSize: FONTS.sizes.lg, fontWeight: FONTS.weights.bold, color: COLORS.salmon, marginBottom: 4 },
  aboutVersion: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted, marginBottom: SPACING.sm },
  aboutText: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 20 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(45,31,31,0.3)', alignItems: 'center', justifyContent: 'center', paddingHorizontal: SPACING.lg },
  modalCard: { width: '100%', backgroundColor: COLORS.surface, borderRadius: RADIUS.xl, padding: SPACING.lg, ...SHADOWS.medium },
  modalTitle: { fontSize: FONTS.sizes.lg, fontWeight: FONTS.weights.bold, color: COLORS.text, marginBottom: SPACING.xs },
  modalHint: { fontSize: FONTS.sizes.sm, color: COLORS.textMuted, marginBottom: SPACING.md },
  modalInput: { backgroundColor: COLORS.background, borderRadius: RADIUS.md, borderWidth: 1.5, borderColor: COLORS.border, paddingHorizontal: SPACING.base, paddingVertical: SPACING.md, fontSize: FONTS.sizes.base, color: COLORS.text, marginBottom: SPACING.base },
  modalInputMulti: { minHeight: 120, textAlignVertical: 'top' },
  modalActions: { flexDirection: 'row', gap: SPACING.sm },
  cancelBtn: { flex: 1, paddingVertical: SPACING.md, borderRadius: RADIUS.md, backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center' },
  cancelText: { fontSize: FONTS.sizes.base, color: COLORS.textSecondary, fontWeight: FONTS.weights.medium },
  saveBtn: { flex: 1, paddingVertical: SPACING.md, borderRadius: RADIUS.md, backgroundColor: COLORS.salmon, alignItems: 'center' },
  saveText: { fontSize: FONTS.sizes.base, color: '#fff', fontWeight: FONTS.weights.semibold },
});
