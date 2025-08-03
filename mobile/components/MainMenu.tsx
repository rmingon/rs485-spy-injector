import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { styles } from '../styles';

interface MainMenuProps {
  historyCount: number;
  onBusOption: (busNumber: number) => void;
  onWiFiSetup: () => void;
  onPresets: () => void;
  onHistory: () => void;
  onDisconnect: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  historyCount,
  onBusOption,
  onWiFiSetup,
  onPresets,
  onHistory,
  onDisconnect,
}) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>ESP32 Controller</Text>
        <TouchableOpacity style={styles.disconnectButton} onPress={onDisconnect}>
          <Text style={styles.disconnectText}>Disconnect</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.menuContainer}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => onBusOption(1)}
        >
          <Text style={styles.menuButtonText}>Bus 1</Text>
          <Text style={styles.menuButtonSubtext}>Configure RS485 Bus 1</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => onBusOption(2)}
        >
          <Text style={styles.menuButtonText}>Bus 2</Text>
          <Text style={styles.menuButtonSubtext}>Configure RS485 Bus 2</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuButton}
          onPress={onWiFiSetup}
        >
          <Text style={styles.menuButtonText}>Set WiFi</Text>
          <Text style={styles.menuButtonSubtext}>Configure WiFi Connection</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuButton}
          onPress={onPresets}
        >
          <Text style={styles.menuButtonText}>Presets</Text>
          <Text style={styles.menuButtonSubtext}>Quick Commands</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuButton}
          onPress={onHistory}
        >
          <Text style={styles.menuButtonText}>History</Text>
          <Text style={styles.menuButtonSubtext}>View Reception History ({historyCount})</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};