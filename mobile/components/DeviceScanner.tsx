import React from 'react';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, SafeAreaView } from 'react-native';
import { BluetoothDevice } from 'react-native-bluetooth-classic';
import { styles } from '../styles';

interface DeviceScannerProps {
  devices: BluetoothDevice[];
  isScanning: boolean;
  isConnecting: boolean;
  onScan: () => void;
  onConnect: (device: BluetoothDevice) => void;
}

export const DeviceScanner: React.FC<DeviceScannerProps> = ({
  devices,
  isScanning,
  isConnecting,
  onScan,
  onConnect,
}) => {
  const renderDeviceItem = ({ item }: { item: BluetoothDevice }) => (
    <TouchableOpacity
      style={styles.deviceItem}
      onPress={() => onConnect(item)}
      disabled={isConnecting}
    >
      <Text style={styles.deviceName}>{item.name || 'Unknown Device'}</Text>
      <Text style={styles.deviceAddress}>{item.address}</Text>
      {item.name === 'ESP32-RS485-GW' && (
        <Text style={styles.targetDevice}>← Target Device</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>ESP32 Bluetooth Scanner</Text>
      
      <TouchableOpacity
        style={styles.scanButton}
        onPress={onScan}
        disabled={isScanning}
      >
        {isScanning ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.buttonText}>Scan for Devices</Text>
        )}
      </TouchableOpacity>

      <FlatList
        data={devices}
        keyExtractor={(item) => item.address}
        renderItem={renderDeviceItem}
        style={styles.deviceList}
        refreshing={isScanning}
        onRefresh={onScan}
      />

      {isConnecting && (
        <View style={styles.connectingOverlay}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.connectingText}>Connecting...</Text>
        </View>
      )}
    </SafeAreaView>
  );
};