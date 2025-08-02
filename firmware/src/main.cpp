#include <Arduino.h>
#include <ArduinoJson.h>
#include <BluetoothSerial.h>
#include <WiFi.h>
#include <vector>

static constexpr int UART1_RX = 21;
static constexpr int UART1_TX = 19;
static constexpr int UART2_RX = 17;
static constexpr int UART2_TX = 16;
static constexpr int RS485_DIR1 = 18;
static constexpr int RS485_DIR2 = 15;

static uint32_t UART1_BAUD = 115200;
static uint32_t UART2_BAUD = 115200;

BluetoothSerial SerialBT;

int tcpPort = 3333;
WiFiServer *tcpServer = nullptr;
WiFiClient tcpClient;

template <size_t N>
struct Ring
{
  volatile uint8_t buf[N];
  volatile size_t head = 0, tail = 0;
  volatile bool chunkReady = false;
  inline bool push(uint8_t b)
  {
    size_t n = (head + 1) % N;
    if (n == tail)
      return false; // Overflow
    buf[head] = b;
    head = n;
    return true;
  }
  size_t popMany(uint8_t *out, size_t maxBytes)
  {
    size_t cnt = 0;
    while (tail != head && cnt < maxBytes)
    {
      out[cnt++] = buf[tail];
      tail = (tail + 1) % N;
    }
    return cnt;
  }
  inline bool empty() const { return head == tail; }
};
static Ring<1024> rb1;
static Ring<1024> rb2;

static char btLine[512];
static size_t btLen = 0;
volatile bool btReady = false;
static char tcpLine[512];
static size_t tcpLen = 0;
volatile bool tcpReady = false;

static inline uint8_t hexVal(char c)
{
  if (c >= '0' && c <= '9')
    return c - '0';
  if (c >= 'a' && c <= 'f')
    return 10 + (c - 'a');
  if (c >= 'A' && c <= 'F')
    return 10 + (c - 'A');
  return 0xFF;
}
bool parseHexBytes(const char *s, std::vector<uint8_t> &out)
{
  uint8_t hn = 0xFF;
  for (; *s; ++s)
  {
    if (*s == ' ' || *s == ',' || *s == ':')
      continue;
    uint8_t v = hexVal(*s);
    if (v == 0xFF)
      continue;
    if (hn == 0xFF)
      hn = v;
    else
    {
      out.push_back((hn << 4) | v);
      hn = 0xFF;
    }
  }
  return hn == 0xFF;
}
String toHexLine(const uint8_t *data, size_t len)
{
  static const char *H = "0123456789ABCDEF";
  String s;
  s.reserve(len * 3);
  for (size_t i = 0; i < len; i++)
  {
    s += H[(data[i] >> 4) & 0xF];
    s += H[data[i] & 0xF];
    if (i + 1 < len)
      s += ' ';
  }
  return s;
}
void rs485SetDir(int pin, bool txOn) { digitalWrite(pin, txOn ? HIGH : LOW); }
void rs485Tx(int bus, const uint8_t *data, size_t len)
{
  HardwareSerial &U = (bus == 1) ? Serial1 : Serial2;
  int dirPin = (bus == 1) ? RS485_DIR1 : RS485_DIR2;
  rs485SetDir(dirPin, true);
  U.write(data, len);
  U.flush();
  rs485SetDir(dirPin, false);
}

void sendJsonToBT(const JsonDocument &d)
{
  serializeJson(d, SerialBT);
  SerialBT.print('\n');
}
void sendJsonToTCP(const JsonDocument &d)
{
  if (tcpClient && tcpClient.connected())
  {
    serializeJson(d, tcpClient);
    tcpClient.print('\n');
  }
}
void sendJsonToAll(const JsonDocument &d)
{
  sendJsonToBT(d);
  sendJsonToTCP(d);
}

void onUart1Rx()
{
  while (Serial1.available())
    rb1.push(Serial1.read());
  rb1.chunkReady = true;
}
void onUart2Rx()
{
  while (Serial2.available())
    rb2.push(Serial2.read());
  rb2.chunkReady = true;
}

void onBtData(const uint8_t *data, size_t len)
{
  for (size_t i = 0; i < len; i++)
  {
    if (btLen < sizeof(btLine) - 1)
      btLine[btLen++] = char(data[i]);
    if (data[i] == '\n')
    {
      btLine[btLen] = '\0';
      btReady = true;
    }
  }
}

bool wifiConnect(const char *ssid, const char *pwd, uint32_t timeoutMs = 8000)
{
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, pwd);
  uint32_t t0 = millis();
  while (WiFi.status() != WL_CONNECTED && (millis() - t0) < timeoutMs)
  {
    delay(100);
  }
  return WiFi.status() == WL_CONNECTED;
}
void tcpStop()
{
  if (tcpClient)
  {
    tcpClient.stop();
  }
  if (tcpServer)
  {
    tcpServer->close();
    delete tcpServer;
    tcpServer = nullptr;
  }
}
bool tcpStart(int port)
{
  tcpStop();
  tcpServer = new WiFiServer(port);
  tcpServer->begin();
  return true;
}

void handleCommand(const JsonDocument &doc)
{
  if (doc.containsKey("bus") && (doc.containsKey("tx_hex") || doc.containsKey("baud")))
  {
    int bus = doc["bus"] | 1;
    if (doc.containsKey("baud"))
    {
      uint32_t baud = doc["baud"].as<uint32_t>();
      if (bus == 1)
      {
        UART1_BAUD = baud;
        Serial1.updateBaudRate(baud);
      }
      else
      {
        UART2_BAUD = baud;
        Serial2.updateBaudRate(baud);
      }
      StaticJsonDocument<128> r;
      r["ok"] = true;
      r["bus"] = bus;
      r["baud"] = baud;
      sendJsonToAll(r);
    }
    if (doc.containsKey("tx_hex"))
    {
      const char *txhex = doc["tx_hex"];
      std::vector<uint8_t> bytes;
      if (parseHexBytes(txhex, bytes) && !bytes.empty())
      {
        rs485Tx(bus, bytes.data(), bytes.size());
        StaticJsonDocument<192> r;
        r["ok"] = true;
        r["bus"] = bus;
        r["tx_hex"] = txhex;
        sendJsonToAll(r);
      }
      else
      {
        StaticJsonDocument<96> r;
        r["ok"] = false;
        r["err"] = "bad tx_hex";
        sendJsonToAll(r);
      }
    }
    return;
  }

  const char *cmd = doc["cmd"] | "";
  if (!strcmp(cmd, "wifi_connect"))
  {
    const char *ssid = doc["ssid"] | "";
    const char *pwd = doc["pwd"] | "";
    int port = doc["port"] | tcpPort;
    bool ok = wifiConnect(ssid, pwd, 8000);
    StaticJsonDocument<192> r;
    r["cmd"] = "wifi_connect";
    r["ok"] = ok;
    if (ok)
    {
      tcpPort = port;
      tcpStart(tcpPort);
      r["ip"] = WiFi.localIP().toString();
      r["port"] = tcpPort;
    }
    else
    {
      r["err"] = "wifi failed";
    }
    sendJsonToAll(r);
    return;
  }
  if (!strcmp(cmd, "wifi_status"))
  {
    StaticJsonDocument<192> r;
    r["cmd"] = "wifi_status";
    r["connected"] = (WiFi.status() == WL_CONNECTED);
    r["ip"] = WiFi.localIP().toString();
    r["rssi"] = (WiFi.status() == WL_CONNECTED) ? WiFi.RSSI() : 0;
    r["tcp"] = (tcpServer != nullptr);
    r["port"] = tcpPort;
    sendJsonToAll(r);
    return;
  }
  if (!strcmp(cmd, "wifi_disconnect"))
  {
    tcpStop();
    WiFi.disconnect(true, true);
    StaticJsonDocument<96> r;
    r["cmd"] = "wifi_disconnect";
    r["ok"] = true;
    sendJsonToAll(r);
    return;
  }
  if (!strcmp(cmd, "tcp_stop"))
  {
    tcpStop();
    StaticJsonDocument<96> r;
    r["cmd"] = "tcp_stop";
    r["ok"] = true;
    sendJsonToAll(r);
    return;
  }

  // IF command not exist
  StaticJsonDocument<96> r;
  r["ok"] = false;
  r["err"] = "unknown command";
  sendJsonToAll(r);
}

void setup()
{
  pinMode(RS485_DIR1, OUTPUT);
  digitalWrite(RS485_DIR1, LOW);
  pinMode(RS485_DIR2, OUTPUT);
  digitalWrite(RS485_DIR2, LOW);

  Serial.begin(115200);

  Serial1.begin(UART1_BAUD, SERIAL_8N1, UART1_RX, UART1_TX);
  Serial2.begin(UART2_BAUD, SERIAL_8N1, UART2_RX, UART2_TX);

  Serial1.setRxFIFOFull(1);
  Serial1.setRxTimeout(2);
  Serial2.setRxFIFOFull(1);
  Serial2.setRxTimeout(2);
  Serial1.onReceive(onUart1Rx, true);
  Serial2.onReceive(onUart2Rx, true);

  SerialBT.begin("ESP32-RS485-GW");
  SerialBT.onData(onBtData);

  Serial.println("RS485 <-> BT/TCP gateway ready. Use Bluetooth to configure Wi-Fi.");
}

void loop()
{
  if (rb1.chunkReady && !rb1.empty())
  {
    uint8_t tmp[512];
    noInterrupts();
    size_t n = rb1.popMany(tmp, sizeof(tmp));
    rb1.chunkReady = false;
    interrupts();
    if (n)
    {
      StaticJsonDocument<160> d;
      d["bus"] = 1;
      d["rx_hex"] = toHexLine(tmp, n);
      sendJsonToAll(d);
    }
  }

  if (rb2.chunkReady && !rb2.empty())
  {
    uint8_t tmp[512];
    noInterrupts();
    size_t n = rb2.popMany(tmp, sizeof(tmp));
    rb2.chunkReady = false;
    interrupts();
    if (n)
    {
      StaticJsonDocument<160> d;
      d["bus"] = 2;
      d["rx_hex"] = toHexLine(tmp, n);
      sendJsonToAll(d);
    }
  }

  if (tcpServer)
  {
    WiFiClient c = tcpServer->available();
    if (c)
    {
      if (tcpClient)
        tcpClient.stop();
      tcpClient = c;
      tcpClient.setNoDelay(true);
      StaticJsonDocument<96> d;
      d["event"] = "tcp_client_connected";
      sendJsonToAll(d);
    }
  }

  if (tcpClient && tcpClient.connected())
  {
    while (tcpClient.available())
    {
      int b = tcpClient.read();
      if (b < 0)
        break;
      if (tcpLen < sizeof(tcpLine) - 1)
        tcpLine[tcpLen++] = char(b);
      if (b == '\n')
      {
        tcpLine[tcpLen] = '\0';
        tcpReady = true;
      }
    }
  }

  if (btReady)
  {
    noInterrupts();
    String line(btLine);
    btLen = 0;
    btReady = false;
    interrupts();
    line.trim();
    if (line.length())
    {
      StaticJsonDocument<512> doc;
      DeserializationError err = deserializeJson(doc, line);
      if (!err)
        handleCommand(doc);
      else
      {
        StaticJsonDocument<128> r;
        r["ok"] = false;
        r["err"] = err.c_str();
        sendJsonToAll(r);
      }
    }
  }

  if (tcpReady)
  {
    noInterrupts();
    String line(tcpLine);
    tcpLen = 0;
    tcpReady = false;
    interrupts();
    line.trim();
    if (line.length())
    {
      StaticJsonDocument<512> doc;
      DeserializationError err = deserializeJson(doc, line);
      if (!err)
        handleCommand(doc);
      else
      {
        StaticJsonDocument<128> r;
        r["ok"] = false;
        r["err"] = err.c_str();
        sendJsonToAll(r);
      }
    }
  }
}