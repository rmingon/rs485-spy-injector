import React from 'react';
import { Modal, View, Text, TouchableOpacity, FlatList } from 'react-native';
import { styles } from '../styles';
import { PresetCommand } from '../types';

interface PresetModalProps {
  visible: boolean;
  commands: PresetCommand[];
  onClose: () => void;
  onAddCustom: () => void;
  onSendCommand: (preset: PresetCommand, bus: number) => void;
  onDeleteCommand: (commandId: string) => void;
}

export const PresetModal: React.FC<PresetModalProps> = ({
  visible,
  commands,
  onClose,
  onAddCustom,
  onSendCommand,
  onDeleteCommand,
}) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { height: '80%' }]}>
          <View style={styles.presetHeader}>
            <Text style={styles.modalTitle}>Preset Commands</Text>
            <View style={styles.presetHeaderButtons}>
              <TouchableOpacity
                style={styles.addButton}
                onPress={onAddCustom}
              >
                <Text style={styles.addButtonText}>+ Add</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.clearButton}
                onPress={onClose}
              >
                <Text style={styles.clearButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <FlatList
            data={commands}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.presetItem}>
                <View style={styles.presetInfo}>
                  <View style={styles.presetNameRow}>
                    <Text style={styles.presetName}>{item.name}</Text>
                    {item.isCustom && (
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => onDeleteCommand(item.id)}
                      >
                        <Text style={styles.deleteButtonText}>×</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                  <Text style={styles.presetDescription}>{item.description}</Text>
                  <Text style={styles.presetHex}>{item.hex}</Text>
                </View>
                
                <View style={styles.presetButtons}>
                  <TouchableOpacity
                    style={[styles.presetButton, styles.bus1Button]}
                    onPress={() => onSendCommand(item, 1)}
                  >
                    <Text style={styles.presetButtonText}>Bus 1</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.presetButton, styles.bus2Button]}
                    onPress={() => onSendCommand(item, 2)}
                  >
                    <Text style={styles.presetButtonText}>Bus 2</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            style={styles.presetList}
          />
        </View>
      </View>
    </Modal>
  );
};