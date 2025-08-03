import React from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity } from 'react-native';
import { styles } from '../styles';

interface CustomCommandModalProps {
  visible: boolean;
  name: string;
  description: string;
  hex: string;
  onClose: () => void;
  onAdd: () => void;
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onHexChange: (value: string) => void;
}

export const CustomCommandModal: React.FC<CustomCommandModalProps> = ({
  visible,
  name,
  description,
  hex,
  onClose,
  onAdd,
  onNameChange,
  onDescriptionChange,
  onHexChange,
}) => {
  const handleCancel = () => {
    onClose();
    onNameChange('');
    onDescriptionChange('');
    onHexChange('');
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Add Custom Command</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Command Name (required)"
            placeholderTextColor="#666"
            value={name}
            onChangeText={onNameChange}
          />
          
          <TextInput
            style={styles.input}
            placeholder="Description (optional)"
            placeholderTextColor="#666"
            value={description}
            onChangeText={onDescriptionChange}
          />
          
          <TextInput
            style={[styles.input, styles.hexInput]}
            placeholder="Hex Data (required) - e.g., '01 03 00 01 00 02 95 CB'"
            placeholderTextColor="#666"
            value={hex}
            onChangeText={onHexChange}
            multiline
          />
          
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={handleCancel}
            >
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.modalButton, styles.connectButton]}
              onPress={onAdd}
            >
              <Text style={[styles.modalButtonText, styles.connectButtonText]}>
                Add Command
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};