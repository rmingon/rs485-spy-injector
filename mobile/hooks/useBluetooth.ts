import { useState, useEffect } from 'react';
import { Alert, Platform, PermissionsAndroid } from 'react-native';
import BluetoothClassic, { BluetoothDevice } from 'react-native-bluetooth-classic';
import { DeviceResponse } from '../types';

export const useBluetooth = () => {
  const [devices, setDevices] = useState<BluetoothDevice[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<any>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const requestBluetoothPermissions = async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      const permissions = [
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ];

      const granted = await PermissionsAndroid.requestMultiple(permissions);
      
      const allPermissionsGranted = permissions.every(
        permission => granted[permission] === PermissionsAndroid.RESULTS.GRANTED
      );

      if (!allPermissionsGranted) {
        Alert.alert('Permissions Required', 'Bluetooth permissions are required to scan for devices');
        return false;
      }
    }
    return true;
  };

  const initializeBluetooth = async () => {
    try {
      const permissionsGranted = await requestBluetoothPermissions();
      if (!permissionsGranted) return;

      const isEnabled = await BluetoothClassic.isBluetoothEnabled();
      if (!isEnabled) {
        await BluetoothClassic.requestBluetoothEnabled();
      }
    } catch (error) {
      Alert.alert('Bluetooth Error', 'Failed to initialize Bluetooth');
    }
  };

  const scanForDevices = async () => {
    try {
      const permissionsGranted = await requestBluetoothPermissions();
      if (!permissionsGranted) return;

      setIsScanning(true);
      setDevices([]);
      
      const pairedDevices = await BluetoothClassic.getBondedDevices();
      setDevices(pairedDevices);
      
      const discoveredDevices = await BluetoothClassic.startDiscovery();
      setDevices(prev => {
        const combined = [...prev];
        discoveredDevices.forEach(device => {
          if (!combined.find(d => d.address === device.address)) {
            combined.push(device);
          }
        });
        return combined;
      });
    } catch (error) {
      console.log(error);
      Alert.alert('Scan Error', 'Failed to scan for devices');
    } finally {
      setIsScanning(false);
    }
  };

  const connectToDevice = async (device: BluetoothDevice, onDataReceived: (response: DeviceResponse) => void) => {
    try {
      setIsConnecting(true);
      
      const connection = await BluetoothClassic.connectToDevice(device.address);
      setConnectedDevice(connection);
      
      connection.onDataReceived((data: any) => {
        console.log('Received:', data);
        try {
          const response = JSON.parse(data.data);
          onDataReceived(response);
        } catch (e) {
          console.log('Non-JSON data received:', data);
        }
      });
      
      Alert.alert('Connected', `Connected to ${device.name || device.address}`);
      return true;
    } catch (error) {
      Alert.alert('Connection Error', 'Failed to connect to device');
      return false;
    } finally {
      setIsConnecting(false);
    }
  };

  const sendCommand = async (command: any) => {
    if (!connectedDevice) {
      Alert.alert('Error', 'No device connected');
      return;
    }
    
    try {
      const jsonCommand = JSON.stringify(command) + '\n';
      await connectedDevice.write(jsonCommand);
    } catch (error) {
      Alert.alert('Send Error', 'Failed to send command');
    }
  };

  const disconnect = async () => {
    if (connectedDevice) {
      try {
        await connectedDevice.disconnect();
        setConnectedDevice(null);
        Alert.alert('Disconnected', 'Device disconnected');
        return true;
      } catch (error) {
        Alert.alert('Error', 'Failed to disconnect');
        return false;
      }
    }
    return false;
  };

  useEffect(() => {
    initializeBluetooth();
    return () => {
      if (connectedDevice) {
        connectedDevice.disconnect();
      }
    };
  }, []);

  return {
    devices,
    connectedDevice,
    isScanning,
    isConnecting,
    scanForDevices,
    connectToDevice,
    sendCommand,
    disconnect,
  };
};