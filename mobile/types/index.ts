export interface HistoryEntry {
  id: string;
  timestamp: Date;
  bus: number;
  data: string;
}

export interface PresetCommand {
  id: string;
  name: string;
  description: string;
  hex: string;
  isCustom: boolean;
}

export interface DeviceResponse {
  ok?: boolean;
  err?: string;
  cmd?: string;
  ip?: string;
  port?: number;
  connected?: boolean;
  rssi?: number;
  tcp?: boolean;
  bus?: number;
  rx_hex?: string;
}

export interface AppState {
  currentPage: 'scan' | 'menu';
  devices: any[];
  connectedDevice: any;
  isScanning: boolean;
  isConnecting: boolean;
  
  // WiFi modal state
  showWifiModal: boolean;
  wifiSSID: string;
  wifiPassword: string;
  wifiPort: string;
  
  // Input modal state
  showInputModal: boolean;
  inputTitle: string;
  inputValue: string;
  inputType: string;
  currentBus: number;
  
  // History state
  receptionHistory: HistoryEntry[];
  showHistoryModal: boolean;
  
  // Preset commands state
  showPresetModal: boolean;
  showCustomCommandModal: boolean;
  customCommandName: string;
  customCommandDescription: string;
  customCommandHex: string;
  customCommands: PresetCommand[];
}

export type InputType = 'hex' | 'baud';
export type PageType = 'scan' | 'menu';