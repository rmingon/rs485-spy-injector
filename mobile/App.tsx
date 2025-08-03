import React, { useState } from 'react';
import { Alert } from 'react-native';
import { BluetoothDevice } from 'react-native-bluetooth-classic';

import {
  DeviceScanner,
  MainMenu,
  WiFiModal,
  InputModal,
  HistoryModal,
  PresetModal,
  CustomCommandModal,
} from './components';

import { useBluetooth } from './hooks/useBluetooth';
import { handleDeviceResponse } from './utils/deviceResponse';
import { DEFAULT_PRESET_COMMANDS } from './constants/presetCommands';
import { HistoryEntry, PresetCommand, InputType, PageType } from './types';

const App = () => {
  // Page state
  const [currentPage, setCurrentPage] = useState<PageType>('scan');

  // Bluetooth hook
  const {
    devices,
    connectedDevice,
    isScanning,
    isConnecting,
    scanForDevices,
    connectToDevice,
    sendCommand,
    disconnect,
  } = useBluetooth();

  const [showWifiModal, setShowWifiModal] = useState(false);
  const [wifiSSID, setWifiSSID] = useState('');
  const [wifiPassword, setWifiPassword] = useState('');
  const [wifiPort, setWifiPort] = useState('3333');

  const [showInputModal, setShowInputModal] = useState(false);
  const [inputTitle, setInputTitle] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [inputType, setInputType] = useState<InputType>('hex');
  const [currentBus, setCurrentBus] = useState(1);

  const [receptionHistory, setReceptionHistory] = useState<HistoryEntry[]>([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  const [showPresetModal, setShowPresetModal] = useState(false);
  const [showCustomCommandModal, setShowCustomCommandModal] = useState(false);
  const [customCommandName, setCustomCommandName] = useState('');
  const [customCommandDescription, setCustomCommandDescription] = useState('');
  const [customCommandHex, setCustomCommandHex] = useState('');
  const [customCommands, setCustomCommands] = useState<PresetCommand[]>([]);

  const allPresetCommands = [...DEFAULT_PRESET_COMMANDS, ...customCommands];

  const handleConnect = async (device: BluetoothDevice) => {
    const success = await connectToDevice(device, (response) => {
      handleDeviceResponse(response, addToHistory);
    });
    
    if (success) {
      setCurrentPage('menu');
    }
  };

  const addToHistory = (entry: HistoryEntry) => {
    setReceptionHistory(prev => [entry, ...prev]);
  };

  const clearHistory = () => {
    setReceptionHistory([]);
  };

  const handleBusOption = (busNumber: number) => {
    Alert.alert(
      `Bus ${busNumber} Options`,
      'Choose an action:',
      [
        {
          text: 'Send Test Data',
          onPress: () => {
            setCurrentBus(busNumber);
            setInputTitle('Send Hex Data');
            setInputType('hex');
            setInputValue('');
            setShowInputModal(true);
          }
        },
        {
          text: 'Set Baud Rate',
          onPress: () => {
            setCurrentBus(busNumber);
            setInputTitle('Set Baud Rate');
            setInputType('baud');
            setInputValue('');
            setShowInputModal(true);
          }
        },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const handleInputSubmit = () => {
    if (!inputValue.trim()) {
      Alert.alert('Error', 'Please enter a value');
      return;
    }

    if (inputType === 'hex') {
      sendCommand({
        bus: currentBus,
        tx_hex: inputValue.trim()
      });
    } else if (inputType === 'baud') {
      const baudRate = parseInt(inputValue.trim(), 10);
      if (isNaN(baudRate)) {
        Alert.alert('Error', 'Please enter a valid number');
        return;
      }
      sendCommand({
        bus: currentBus,
        baud: baudRate
      });
    }

    setShowInputModal(false);
    setInputValue('');
  };

  const handleWifiConnect = () => {
    if (!wifiSSID) {
      Alert.alert('Error', 'Please enter WiFi SSID');
      return;
    }
    
    sendCommand({
      cmd: 'wifi_connect',
      ssid: wifiSSID,
      pwd: wifiPassword,
      port: parseInt(wifiPort, 10) || 3333
    });
    
    setShowWifiModal(false);
    setWifiSSID('');
    setWifiPassword('');
    setWifiPort('3333');
  };

  const sendPresetCommand = (preset: PresetCommand, busNumber: number) => {
    sendCommand({
      bus: busNumber,
      tx_hex: preset.hex
    });
    setShowPresetModal(false);
    Alert.alert('Command Sent', `"${preset.name}" sent to Bus ${busNumber}`);
  };

  const addCustomCommand = () => {
    if (!customCommandName.trim() || !customCommandHex.trim()) {
      Alert.alert('Error', 'Please enter both name and hex data');
      return;
    }

    const newCommand: PresetCommand = {
      id: Date.now().toString(),
      name: customCommandName.trim(),
      description: customCommandDescription.trim() || 'Custom command',
      hex: customCommandHex.trim(),
      isCustom: true
    };

    setCustomCommands(prev => [...prev, newCommand]);
    setCustomCommandName('');
    setCustomCommandDescription('');
    setCustomCommandHex('');
    setShowCustomCommandModal(false);
    Alert.alert('Success', 'Custom command added successfully');
  };

  const deleteCustomCommand = (commandId: string) => {
    Alert.alert(
      'Delete Command',
      'Are you sure you want to delete this custom command?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setCustomCommands(prev => prev.filter(cmd => cmd.id !== commandId));
            Alert.alert('Deleted', 'Custom command deleted');
          }
        }
      ]
    );
  };

  const handleDisconnect = async () => {
    const success = await disconnect();
    if (success) {
      setCurrentPage('scan');
    }
  };

  if (currentPage === 'scan') {
    return (
      <DeviceScanner
        devices={devices}
        isScanning={isScanning}
        isConnecting={isConnecting}
        onScan={scanForDevices}
        onConnect={handleConnect}
      />
    );
  }

  return (
    <>
      <MainMenu
        historyCount={receptionHistory.length}
        onBusOption={handleBusOption}
        onWiFiSetup={() => setShowWifiModal(true)}
        onPresets={() => setShowPresetModal(true)}
        onHistory={() => setShowHistoryModal(true)}
        onDisconnect={handleDisconnect}
      />

      <WiFiModal
        visible={showWifiModal}
        wifiSSID={wifiSSID}
        wifiPassword={wifiPassword}
        wifiPort={wifiPort}
        onClose={() => setShowWifiModal(false)}
        onConnect={handleWifiConnect}
        onSSIDChange={setWifiSSID}
        onPasswordChange={setWifiPassword}
        onPortChange={setWifiPort}
      />

      <InputModal
        visible={showInputModal}
        title={inputTitle}
        value={inputValue}
        inputType={inputType}
        onClose={() => setShowInputModal(false)}
        onSubmit={handleInputSubmit}
        onValueChange={setInputValue}
      />

      <HistoryModal
        visible={showHistoryModal}
        history={receptionHistory}
        onClose={() => setShowHistoryModal(false)}
        onClearHistory={clearHistory}
      />

      <PresetModal
        visible={showPresetModal}
        commands={allPresetCommands}
        onClose={() => setShowPresetModal(false)}
        onAddCustom={() => setShowCustomCommandModal(true)}
        onSendCommand={sendPresetCommand}
        onDeleteCommand={deleteCustomCommand}
      />

      <CustomCommandModal
        visible={showCustomCommandModal}
        name={customCommandName}
        description={customCommandDescription}
        hex={customCommandHex}
        onClose={() => setShowCustomCommandModal(false)}
        onAdd={addCustomCommand}
        onNameChange={setCustomCommandName}
        onDescriptionChange={setCustomCommandDescription}
        onHexChange={setCustomCommandHex}
      />
    </>
  );
};

export default App;