#include <Wire.h>
#include <Adafruit_Sensor.h>
#include <Adafruit_BMP280.h>
#include <SPI.h>
#include <MFRC522.h>
#include <ESP32Servo.h>
#include <LiquidCrystal_I2C.h>
#include <Firebase_ESP_Client.h>
#include "addons/TokenHelper.h"
#include "addons/RTDBHelper.h"

#define WIFI_SSID "ESP32Test"
#define WIFI_PASSWORD ""
#define API_KEY ""
#define USER_EMAIL ""
#define USER_PASSWORD ""
#define DATABASE_URL ""

// Firebase objects
FirebaseData fbdoStream;
FirebaseData fbdoWrite;
FirebaseAuth auth;
FirebaseConfig config;

// Database paths
String uid;
String databasePath;
String listenerPath = "UsersData/";
String tempPath;
String presPath;
#define LCD_SDA 21
#define LCD_SCL 22
TwoWire I2C_LCD = TwoWire(0);
// Sensor and hardware configuration
#define SEALEVELPRESSURE_HPA (1013.25)
#define BMP_SDA 21
#define BMP_SCL 22
#define RST_PIN 4
#define MQ_PIN 33
#define SS_PIN 5
#define SERVO_PIN 14
#define ENTRANCE_IR_PIN 27
#define EXIT_IR_PIN 32

Adafruit_BMP280 bmp;
MFRC522 rfid(SS_PIN, RST_PIN);
Servo myservo;
LiquidCrystal_I2C lcd(0x27, 16, 2);
unsigned long sendDataPrevMillis = 0;
unsigned long timerDelay = 180000;
const int yellowLed = 12;
const int redLed = 13;
const int greenLed = 2;
float temperature;
float pressure;
volatile int carCount = 0;
unsigned long currentTime = 0;
unsigned long lastReadTime = 0;
unsigned int intervalDelay = 1000;

void IRAM_ATTR entranceISR() {
  currentTime = millis();
  if (currentTime - lastReadTime > intervalDelay) {
    carCount++;
    lastReadTime = currentTime;
  }
}

void IRAM_ATTR exitISR() {
  currentTime = millis();
  if (currentTime - lastReadTime > intervalDelay) {
    if (carCount > 0) {
      carCount--;
    }
    lastReadTime = currentTime;
  }
}

void initWiFi() {
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to WiFi ..");
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print('.');
    delay(1000);
  }
  Serial.println(WiFi.localIP());
  Serial.println();
}

void sendFloat(String path, float value) {
  if (Firebase.RTDB.setFloat(&fbdoWrite, path.c_str(), value)) {
    Serial.print("Writing value: ");
    Serial.print(value);
    Serial.print(" on the following path: ");
    Serial.println(path);
    Serial.println("PASSED");
    Serial.println("PATH: " + fbdoWrite.dataPath());
    Serial.println("TYPE: " + fbdoWrite.dataType());
  } else {
    Serial.println("FAILED");
    Serial.println("REASON: " + fbdoWrite.errorReason());
  }
}

void streamCallback(FirebaseStream data) {
  Serial.printf("stream path, %s\nevent path, %s\ndata type, %s\nevent type, %s\n\n",
                data.streamPath().c_str(),
                data.dataPath().c_str(),
                data.dataType().c_str(),
                data.eventType().c_str());
  printResult(data);
  Serial.println();

  String streamPath = String(data.dataPath());
  if (data.dataTypeEnum() == fb_esp_rtdb_data_type_integer) {
    String gpio = streamPath.substring(1);
    int state = data.intData();
    Serial.print("GPIO: ");
    Serial.println(gpio);
    Serial.print("STATE: ");
    Serial.println(state);
    digitalWrite(gpio.toInt(), state);
  }

  if (data.dataTypeEnum() == fb_esp_rtdb_data_type_json) {
    FirebaseJson json = data.to<FirebaseJson>();
    size_t count = json.iteratorBegin();
    Serial.println("\n---------");
    for (size_t i = 0; i < count; i++) {
      FirebaseJson::IteratorValue value = json.valueAt(i);
      int gpio = value.key.toInt();
      int state = value.value.toInt();
      Serial.print("STATE: ");
      Serial.println(state);
      Serial.print("GPIO:");
      Serial.println(gpio);
      digitalWrite(gpio, state);
      Serial.printf("Name: %s, Value: %s, Type: %s\n", value.key.c_str(), value.value.c_str(), value.type == FirebaseJson::JSON_OBJECT ? "object" : "array");
    }
    Serial.println();
    json.iteratorEnd();
  }

  Serial.printf("Received stream payload size: %d (Max. %d)\n\n", data.payloadLength(), data.maxPayloadLength());
}

void streamTimeoutCallback(bool timeout) {
  if (timeout)
    Serial.println("stream timeout, resuming...\n");
  if (!fbdoStream.httpConnected())
    Serial.printf("error code: %d, reason: %s\n\n", fbdoStream.httpCode(), fbdoStream.errorReason().c_str());
}

void setup() {
  Serial.begin(115200);

  Wire.begin(BMP_SDA, BMP_SCL);
  if (!bmp.begin(0x76)) {
    Serial.println("Could not find a valid BMP280 sensor, check wiring!");
    while (1);
  }
  I2C_LCD.begin(LCD_SDA, LCD_SCL);
  initWiFi();
  pinMode(redLed, OUTPUT);
  pinMode(yellowLed, OUTPUT);
  pinMode(greenLed, OUTPUT);
  auth.user.email = USER_EMAIL;
  auth.user.password = USER_PASSWORD;

  config.api_key = API_KEY;
  config.database_url = DATABASE_URL;
  Firebase.reconnectWiFi(true);
  fbdoStream.setResponseSize(4096);
  fbdoWrite.setResponseSize(4096);
  config.token_status_callback = tokenStatusCallback;
  config.max_token_generation_retry = 5;
  Firebase.begin(&config, &auth);

  Serial.println("Getting User UID");
  while ((auth.token.uid) == "") {
    Serial.print('.');
    delay(1000);
  }

  uid = auth.token.uid.c_str();
  Serial.print("User UID: ");
  Serial.println(uid);

  databasePath = "/UsersData/" + uid;
  listenerPath = listenerPath + uid + "/outputs/digital/";
  tempPath = databasePath + "/temperature";
  presPath = databasePath + "/pressure";

  SPI.begin();
  rfid.PCD_Init();
  Serial.println("Scan your RFID card");

  myservo.attach(SERVO_PIN);
  myservo.write(0);

  pinMode(ENTRANCE_IR_PIN, INPUT);
  pinMode(EXIT_IR_PIN, INPUT);
  attachInterrupt(digitalPinToInterrupt(ENTRANCE_IR_PIN), entranceISR, FALLING);
  attachInterrupt(digitalPinToInterrupt(EXIT_IR_PIN), exitISR, FALLING);

  lcd.init();
  lcd.backlight();
  lcd.setCursor(0, 0);
  lcd.print("Cars: ");
  lcd.setCursor(6, 0);
  lcd.print(carCount);

  if (!Firebase.RTDB.beginStream(&fbdoStream, listenerPath.c_str()))
    Serial.printf("stream begin error, %s\n\n", fbdoStream.errorReason().c_str());

  Firebase.RTDB.setStreamCallback(&fbdoStream, streamCallback, streamTimeoutCallback);

  delay(2000);
}

void loop() {
  // Read BMP280 sensor
  if (Firebase.ready() && (millis() - sendDataPrevMillis > timerDelay || sendDataPrevMillis == 0)) {
    sendDataPrevMillis = millis();

    temperature = bmp.readTemperature();
    pressure = bmp.readPressure() / 100.0F;

    sendFloat(tempPath, temperature);
    sendFloat(presPath, pressure);
  }

  // Check for RFID card
  if (rfid.PICC_IsNewCardPresent() && rfid.PICC_ReadCardSerial()) {
    Serial.print("UID tag: ");
    String content = "";
    for (byte i = 0; i < rfid.uid.size; i++) {
      Serial.print(rfid.uid.uidByte[i] < 0x10 ? " 0" : " ");
      Serial.print(rfid.uid.uidByte[i], HEX);
      content.concat(String(rfid.uid.uidByte[i] < 0x10 ? " 0" : " "));
      content.concat(String(rfid.uid.uidByte[i], HEX));
    }
    Serial.println();
    content.toUpperCase();
    Serial.print("Message: ");
    Serial.println(content);

    if (content.substring(1) == "3B D8 07 2E") {
      Serial.println("Authorized access");
      myservo.write(180);
      delay(3000);
      myservo.write(0);
    } else {
      Serial.println("Access denied");
      delay(3000);
    }

    rfid.PICC_HaltA();
    rfid.PCD_StopCrypto1();
  }

  // Update LCD if car count changes
  static int lastCarCount = -1;
  if (carCount != lastCarCount) {
    lcd.setCursor(0,1);
    lcd.print(carCount);
    Serial.print("Car count updated: ");
    Serial.println(carCount);
    Serial.println(analogRead(MQ_PIN));
    lastCarCount = carCount;
  }

  // Handle Firebase token expiration
  if (Firebase.isTokenExpired()) {
    Firebase.refreshToken(&config);
    Serial.println("Token refreshed");
  }

  delay(1000);
}
