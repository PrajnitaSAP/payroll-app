import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ConfirmRemoveModal({ visible, employeeName, onConfirm, onCancel }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>Remove Employee?</Text>
          <Text style={styles.message}>
            <Text style={styles.name}>{employeeName}</Text>
            {' '}will be permanently removed from your team. This cannot be undone.
          </Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelButton} activeOpacity={0.7} onPress={onCancel}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.removeButton} activeOpacity={0.7} onPress={onConfirm}>
              <Text style={styles.removeText}>Remove</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 24,
    width: '100%',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 10,
  },
  message: {
    fontSize: 15,
    color: '#3C3C43',
    lineHeight: 22,
    marginBottom: 24,
  },
  name: {
    fontWeight: '700',
    color: '#000',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  removeButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#FF3B30',
  },
  removeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
