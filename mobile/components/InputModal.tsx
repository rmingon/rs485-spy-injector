import React from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity } from 'react-native';
import { styles } from '../styles';
import { InputType } from '../types';

interface InputModalProps {
  visible: boolean;
  title: string;
  value: string;
  inputType: InputType;
  onClose: () => void;
  onSubmit: () => void;
  onValueChange: (value: string) => void;
}

export const InputModal: React.FC<InputModalProps> = ({
  visible,
  title,
  value,
  inputType,
  onClose,
  onSubmit,
  onValueChange,
}) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{title}</Text>
          
          <TextInput
            style={styles.input}
            placeholder={inputType === 'baud' ? 'Enter baud rate (e.g., 115200)' : 'Enter hex data (e.g., "01 02 03")'}
            placeholderTextColor="#666"
            value={value}
            onChangeText={onValueChange}
            keyboardType={inputType === 'baud' ? 'numeric' : 'default'}
          />
          
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={onClose}
            >
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.modalButton, styles.connectButton]}
              onPress={onSubmit}
            >
              <Text style={[styles.modalButtonText, styles.connectButtonText]}>
                Send
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};