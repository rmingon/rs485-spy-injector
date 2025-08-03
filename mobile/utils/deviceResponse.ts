import { Alert } from 'react-native';
import { DeviceResponse, HistoryEntry } from '../types';

export const handleDeviceResponse = (
  response: DeviceResponse,
  addToHistory: (entry: HistoryEntry) => void
) => {
  if (response.ok === false) {
    Alert.alert('Device Error', response.err || 'Unknown error');
    return;
  }
  
  if (response.cmd === 'wifi_connect') {
    if (response.ok) {
      Alert.alert('WiFi Connected', `IP: ${response.ip}\nPort: ${response.port}`);
    } else {
      Alert.alert('WiFi Error', response.err || 'Connection failed');
    }
  } else if (response.cmd === 'wifi_status') {
    const status = response.connected ? 'Connected' : 'Disconnected';
    const details = response.connected 
      ? `IP: ${response.ip}\nRSSI: ${response.rssi}\nTCP Server: ${response.tcp ? 'Running' : 'Stopped'}`
      : 'Not connected';
    Alert.alert('WiFi Status', `${status}\n${details}`);
  } else if (response.bus && response.rx_hex) {
    // Add to reception history
    const historyEntry: HistoryEntry = {
      id: Date.now().toString(),
      timestamp: new Date(),
      bus: response.bus,
      data: response.rx_hex
    };
    addToHistory(historyEntry);
    
    Alert.alert(`Bus ${response.bus} Data`, `Received: ${response.rx_hex}`);
  }
};