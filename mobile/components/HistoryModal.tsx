import React from 'react';
import { Modal, View, Text, TouchableOpacity, FlatList, Alert } from 'react-native';
import { styles } from '../styles';
import { HistoryEntry } from '../types';

interface HistoryModalProps {
  visible: boolean;
  history: HistoryEntry[];
  onClose: () => void;
  onClearHistory: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  visible,
  history,
  onClose,
  onClearHistory,
}) => {
  const handleClear = () => {
    onClearHistory();
    Alert.alert('History Cleared', 'All reception history has been cleared');
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { height: '80%' }]}>
          <View style={styles.historyHeader}>
            <Text style={styles.modalTitle}>Reception History</Text>
            <TouchableOpacity
              style={styles.clearButton}
              onPress={handleClear}
            >
              <Text style={styles.clearButtonText}>Clear</Text>
            </TouchableOpacity>
          </View>
          
          {history.length === 0 ? (
            <View style={styles.emptyHistory}>
              <Text style={styles.emptyHistoryText}>No reception history yet</Text>
            </View>
          ) : (
            <FlatList
              data={history}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.historyItem}>
                  <View style={styles.historyItemHeader}>
                    <Text style={styles.historyBus}>Bus {item.bus}</Text>
                    <Text style={styles.historyTime}>
                      {item.timestamp.toLocaleTimeString()}
                    </Text>
                  </View>
                  <Text style={styles.historyData}>{item.data}</Text>
                </View>
              )}
              style={styles.historyList}
            />
          )}
          
          <TouchableOpacity
            style={styles.historyCloseButton}
            onPress={onClose}
          >
            <Text style={styles.connectButtonText}>
              Close
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};