import React from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity } from 'react-native';
import { styles } from '../styles';

interface WiFiModalProps {
  visible: boolean;
  wifiSSID: string;
  wifiPassword: string;
  wifiPort: string;
  onClose: () => void;
  onConnect: () => void;
  onSSIDChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onPortChange: (value: string) => void;
}

export const WiFiModal: React.FC<WiFiModalProps> = ({
  visible,
  wifiSSID,
  wifiPassword,
  wifiPort,
  onClose,
  onConnect,
  onSSIDChange,
  onPasswordChange,
  onPortChange,
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
          <Text style={styles.modalTitle}>WiFi Configuration</Text>
          
          <TextInput
            style={styles.input}
            placeholder="WiFi SSID"
            placeholderTextColor="#666"
            value={wifiSSID}
            onChangeText={onSSIDChange}
          />
          
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#666"
            value={wifiPassword}
            onChangeText={onPasswordChange}
            secureTextEntry
          />
          
          <TextInput
            style={styles.input}
            placeholder="TCP Port (default: 3333)"
            placeholderTextColor="#666"
            value={wifiPort}
            onChangeText={onPortChange}
            keyboardType="numeric"
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
              onPress={onConnect}
            >
              <Text style={[styles.modalButtonText, styles.connectButtonText]}>
                Connect
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};