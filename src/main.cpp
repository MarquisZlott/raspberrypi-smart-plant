/*
  This code is for Sensor node board,
  which will get&process value from sensors,
  then sending it to hub board through WiFi
*/

#include <WiFi.h>
#include <WiFiClient.h>
#include "DHT.h"
#include "MQ135.h"

//=====================[stuff for MQ-2 sensor]=====================
#define MQ_PIN (35)                       // define which analog input channel you are going to use
#define RL_VALUE (1)                      // define the load resistance on the board, in kilo ohms
#define RO_CLEAN_AIR_FACTOR (9.83)        // RO_CLEAR_AIR_FACTOR=(Sensor resistance in clean air)/RO,
#define CALIBARAION_SAMPLE_TIMES (50)     // define how many samples you are going to take in the calibration phase
#define CALIBRATION_SAMPLE_INTERVAL (500) // define the time interal(in milisecond) between each samples in the
#define READ_SAMPLE_INTERVAL (50)         // define how many samples you are going to take in normal operation
#define READ_SAMPLE_TIMES (5)             // define the time interal(in milisecond) between each samples in
#define GAS_LPG (0)
#define GAS_CO (1)
#define GAS_SMOKE (2)
float LPGCurve[3] = {2.3, 0.21, -0.47};   // two points are taken from the curve.
float COCurve[3] = {2.3, 0.72, -0.34};    // two points are taken from the curve.
float SmokeCurve[3] = {2.3, 0.53, -0.44}; // two points are taken from the curve.
float Ro = 10;                            // Ro is initialized to 10 kilo ohms
//=================================================================

// pins
#define DHTTYPE DHT22
#define co2Pin 34
#define tempHumidPin 15

#define CO_ALERT "co_alert"
#define LPG_ALERT "lpg_alert"
#define CO2_ALERT "co2_alert"

const char *ssid = "esp32airhub";     // wifi id of hub
const char *password = "12345678";    // wifi password of hub
const char *serverIP = "192.168.4.1"; // Hub Server IP address
const ulong connectionDelay = 5000;   // milli re-attempt wifi connection interval
const uint16_t serverPort = 80;
int soundData;
ulong lastConnectionAttempt;
// int gasData;

// data from MQ-135
int co2Data;
// data from MQ-2
int lpgData;
int coData;
int smokeData;
// data from DHT22
float tempData;
float humidData;

WiFiClient client;
MQ135 mq135 = MQ135(co2Pin);
DHT dht(tempHumidPin, DHTTYPE);

float MQResistanceCalculation(int raw_adc)
{
  return (((float)RL_VALUE * (4095 - raw_adc) / raw_adc));
}
float MQCalibration(int mq_pin)
{
  int i;
  float val = 0;

  for (i = 0; i < CALIBARAION_SAMPLE_TIMES; i++)
  { // take multiple samples
    val += MQResistanceCalculation(analogRead(mq_pin));
    delay(CALIBRATION_SAMPLE_INTERVAL);
  }
  val = val / CALIBARAION_SAMPLE_TIMES; // calculate the average value

  val = val / RO_CLEAN_AIR_FACTOR; // divided by RO_CLEAN_AIR_FACTOR yields the Ro
  // according to the chart in the datasheet

  return val;
}
float MQRead(int mq_pin)
{
  int i;
  float rs = 0;

  for (i = 0; i < READ_SAMPLE_TIMES; i++)
  {
    rs += MQResistanceCalculation(analogRead(mq_pin));
    delay(READ_SAMPLE_INTERVAL);
  }

  rs = rs / READ_SAMPLE_TIMES;

  return rs;
}
int MQGetPercentage(float rs_ro_ratio, float *pcurve)
{
  return (pow(10, (((log(rs_ro_ratio) - pcurve[1]) / pcurve[2]) + pcurve[0])));
}
int MQGetGasPercentage(float rs_ro_ratio, int gas_id)
{
  if (gas_id == GAS_LPG)
  {
    return MQGetPercentage(rs_ro_ratio, LPGCurve);
  }
  else if (gas_id == GAS_CO)
  {
    return MQGetPercentage(rs_ro_ratio, COCurve);
  }
  else if (gas_id == GAS_SMOKE)
  {
    return MQGetPercentage(rs_ro_ratio, SmokeCurve);
  }

  return 0;
}

// store all sensors value in variables
void updateSensorData()
{
  co2Data = mq135.getPPM();
  lpgData = MQGetGasPercentage(MQRead(MQ_PIN) / Ro, GAS_LPG);
  coData = MQGetGasPercentage(MQRead(MQ_PIN) / Ro, GAS_CO);
  smokeData = MQGetGasPercentage(MQRead(MQ_PIN) / Ro, GAS_SMOKE);

  float h = dht.readHumidity();    // as percentage
  float t = dht.readTemperature(); // as Celcius
  humidData = h;
  tempData = t;
  float f = dht.readTemperature(true);
  if (isnan(h) || isnan(t) || isnan(f))
  {
    Serial.println(F("Failed to read from DHT sensor!"));
  }
  float hic = dht.computeHeatIndex(t, h, false);
}

void printLog()
{
  Serial.print("======DHT-22======\n");
  Serial.print("Humid: ");
  Serial.println(humidData);
  Serial.print("Temp: ");
  Serial.println(tempData);

  Serial.print("======MQ-135======\n");
  Serial.print("MQ-135: ");
  Serial.println(co2Data);

  Serial.print("======MQ-2======\n");
  Serial.print("LPG:");
  Serial.print(lpgData);
  Serial.print("ppm");
  Serial.print("    ");

  Serial.print("CO:");
  Serial.print(coData);
  Serial.print("ppm");
  Serial.print("    ");

  Serial.print("SMOKE:");
  Serial.print(smokeData);
  Serial.print("ppm");
  Serial.print("\n");
}

// convert all sensors data to string for sending to hub
String makeDataPayload(float temperature, float humidity, int lpg, int co, int smoke, int co2)
{
  String s = "";
  s = s + temperature + ",";
  s = s + humidity + ",";
  s = s + lpg + ",";
  s = s + co + ",";
  s = s + smoke + ",";
  s = s + co2;
  return s;
}

void setup()
{

  Serial.begin(115200);

  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password); // try connecting to hub wifi
  Serial.println("Connecting to hub Wi-Fi...");
  while (WiFi.status() != WL_CONNECTED)
  {
    delay(1000);
    Serial.print(".");
  }
  Serial.println("\nConnected!");

  if (client.connect(serverIP, serverPort)) // try connecting to hub server
  {
    Serial.println("====[Hub server connected]====");
  }

  dht.begin();
  // calibrate MQ-2
  Serial.print("Calibrating...\n");
  Ro = MQCalibration(MQ_PIN);
  Serial.print("Calibration is done...\n");
  Serial.print("Ro=");
  Serial.print(Ro);
  Serial.print("kohm");
  Serial.print("\n");
  Serial.println("====[Sensors are ready]====");
  // calibrate MQ-135 with DHT-22 helps
  float cal_rzero = mq135.getCorrectedRZero(dht.readTemperature(), dht.readHumidity());
  mq135.setRZero(cal_rzero);
}

void loop()
{
  // get value from sensors every 5 sec
  delay(5000);

  updateSensorData();
  printLog();

  // send data to hub board
  // handle lost connection
  if (WiFi.status() != WL_CONNECTED)
  {
    // check delay:
    if (millis() - lastConnectionAttempt >= connectionDelay)
    {
      lastConnectionAttempt = millis();
      {
        WiFi.begin(ssid, password);
      }
    }
  }
  else
  {
    client.connect(serverIP, serverPort);
    if (client.connected())
    {
      String payload = makeDataPayload(tempData, humidData, lpgData, coData, smokeData, co2Data);
      Serial.print("Sent->");
      Serial.println(payload);
      client.println(payload);
    }
    else
    {
      Serial.println("Cannot send data due to lost connection");
    }
  }
}