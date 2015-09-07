// TI SensorTag - Simple Key Service
// http://processors.wiki.ti.com/index.php/SensorTag_User_Guide#Simple_Key_Service

#include <SPI.h>
#include <BLEPeripheral.h>

// Adafruit nRF8001
#define BLE_REQ 10
#define BLE_RDY 2
#define BLE_RST 9

#define LEFT_BUTTON  3
#define RIGHT_BUTTON 4

uint8_t buttonState;
uint8_t leftButtonState;
uint8_t rightButtonState;

long lastTime = 0;
uint8_t interval = 20;

BLEPeripheral blePeripheral = BLEPeripheral(BLE_REQ, BLE_RDY, BLE_RST);
BLEService simpleKeyService = BLEService("FFE0");
BLEUnsignedCharCharacteristic characteristic = BLEUnsignedCharCharacteristic("FFE1", BLENotify);

void setup() {
  Serial.begin(9600);
  Serial.println(F("SensorTag"));

  pinMode(LEFT_BUTTON, INPUT_PULLUP);
  pinMode(RIGHT_BUTTON, INPUT_PULLUP);

  blePeripheral.setLocalName("SensorT4g");
  blePeripheral.setDeviceName("SensorT4g");
  
  blePeripheral.addAttribute(simpleKeyService);
  blePeripheral.addAttribute(characteristic);
  
  blePeripheral.begin();
}

void loop() {
  blePeripheral.poll();

  if (millis() - lastTime > interval) {
    checkButtons();
  }
}

void checkButtons() {

  leftButtonState = digitalRead(LEFT_BUTTON);
  rightButtonState = digitalRead(RIGHT_BUTTON);

  // using a pullup resistor so LOW means button is pressed
  // assume LOW = 0 and HIGH = 1

  // flip the bits
  rightButtonState = rightButtonState ^ 1;  
  leftButtonState = leftButtonState ^ 1;  

  // left button is bit 2, shift
  leftButtonState = leftButtonState << 1;

  buttonState = leftButtonState + rightButtonState;

  if (buttonState != characteristic.value()) {
    Serial.print("Setting characteristic to "); 
    Serial.println(buttonState, HEX);
    characteristic.setValue(buttonState);
  }
     
}

