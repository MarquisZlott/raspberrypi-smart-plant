/*
  This code is for Gateway node board,
  which will receive data sensors node board,
  then sending it to cloud storage through internet
*/

// get this from your blynk
#define BLYNK_TEMPLATE_ID "TMPL6MODkWzrc"
#define BLYNK_TEMPLATE_NAME "Lab"
#define BLYNK_AUTH_TOKEN "ApnnWTRfbbyaI6DSV5V6Mb1CZjVE359T"

#include <WiFi.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <BlynkSimpleEsp32.h>

struct sensorDatas
{
  float temp;
  float humid;
  int co;
  int lpg;
  int smoke;
  int co2;
};

#define WIFI_ID "SRMun"
#define WIFI_PASS "ybnk7998"

// Blynk noti keyword
#define TEMP_ALERT "temp_alert"
#define HUMID_ALERT "humid_alert"
#define CO_ALERT "co_alert"
#define LPG_ALERT "lpg_alert"
#define CO2_ALERT "co2_alert"

// set id&pass for this board
const char *ssid = "esp32airhub";
const char *password = "12345678";

const int btnPin = 26;
const int buzzerPin = 25;
const char *auth = BLYNK_AUTH_TOKEN;
const int lcdSleepInterval = 15000; // milli before lcd screen goes off
const ulong connectionDelay = 5000; // milli re-attempt wifi connection interval
const ulong cycleInterval = 4000;   // milli lcd screen cycle interval
const ulong scrollInterval = 250;   // milli lcd screen scrolling interval

bool isScreenOff = false;
bool isAlert = false;
bool readyToSend = false;

// crit flag for each value
bool isTempCrit = false;
bool isHumidCrit = false;
bool isCoCrit = false;
bool isLpgCrit = false;
bool isCo2Crit = false;
bool isSmokeCrit = false;

int lcdCycleCount = 0;
int lcdScrollIdx = 0;
sensorDatas currentPayload;
TaskHandle_t BuzzerTask = NULL;
ulong timePrev,
    screenTimeNow,
    screenTimePrev,
    screenoffTimer,
    lastConnectionAttempt,
    prevCycleTime,
    cycleTimer,
    alertTimer,
    scrollTimer,
    lastPressed;

// init objects needed
LiquidCrystal_I2C lcd(0x27, 16, 2); // set the LCD address to 0x27 for a 16 chars and 2 line display
WiFiServer server(80);              // server for data transfer
BlynkTimer timer;

/*
split all payload string into sensorDatas
payload comes in format "temp,humid,lpg,co,smoke,co2"
*/
void extractPayload(String &payload)
{
  // must convert to char[]
  char payload_char[payload.length()];
  for (int i = 0; i < payload.length(); i++)
  {
    payload_char[i] = payload[i];
  }

  byte index = 0;
  char *extracted[payload.length()];
  char *ptr = strtok(payload_char, ","); // delimiter
  while (ptr != NULL)
  {
    extracted[index] = ptr;
    index++;
    ptr = strtok(NULL, ",");
  }

  // put their in currentPayload
  currentPayload.temp = atof(extracted[0]);
  currentPayload.humid = atof(extracted[1]);
  currentPayload.lpg = atoi(extracted[2]);
  currentPayload.co = atoi(extracted[3]);
  currentPayload.smoke = atoi(extracted[4]);
  currentPayload.co2 = atoi(extracted[5]);
}

void buzzerTask(void *pvParameters)
{
  isAlert = true;
  // set scrolling text (max 40 chars before line breaked)
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("CRITICAL VALUES REACHED!!!        ");
  lcd.setCursor(0, 1);
  lcd.print("PLEASE CHECK PLEASE CHECK PLEASE CHECK ");
  for (int i = 0; i < 30; i++)
  {
    tone(buzzerPin, 500, 100);
    delay(500);
  }
  isAlert = false;
  vTaskDelete(BuzzerTask);
}

void sendToBlynk()
{
  if (!readyToSend)
    return;
  Blynk.virtualWrite(V0, currentPayload.temp);  // in celcius
  Blynk.virtualWrite(V1, currentPayload.humid); // in %
  Blynk.virtualWrite(V2, currentPayload.lpg);   // in PPM
  Blynk.virtualWrite(V3, currentPayload.co);    // in PPM
  Blynk.virtualWrite(V4, currentPayload.smoke); // in PPM
  Blynk.virtualWrite(V5, currentPayload.co2);   // in PPM

  if (currentPayload.temp >= 40 && currentPayload.temp <= 5)
  {
    isTempCrit = true;
    Blynk.logEvent(TEMP_ALERT);
  }
  if (currentPayload.humid >= 75 && currentPayload.humid <= 25)
  {
    isHumidCrit = true;
    Blynk.logEvent(HUMID_ALERT);
  }
  if (currentPayload.co > 200)
  {
    isCoCrit = true;
    Blynk.logEvent(CO_ALERT);
  }
  if (currentPayload.lpg > 200)
  {
    isLpgCrit = true;
    Blynk.logEvent(LPG_ALERT);
  }
  if (currentPayload.co2 > 1500)
  {
    isCo2Crit = true;
    Blynk.logEvent(CO2_ALERT);
  }
  if (currentPayload.smoke > 2000)
  {
    isSmokeCrit = true;
  }
  if (!isAlert && (isTempCrit || isHumidCrit || isCoCrit || isLpgCrit || isCo2Crit || isSmokeCrit))
  {
    xTaskCreate(buzzerTask, "buzzer-task", 2048, NULL, 1, &BuzzerTask); // start alarm buzzer
    isTempCrit = false;
    isHumidCrit = false;
    isCoCrit = false;
    isLpgCrit = false;
    isCo2Crit = false;
  }

  readyToSend = false;
}

void cycleLcd(bool forced)
{

  // ignore alert message
  if (forced)
  {
    isAlert = false;
  }
  // cycle lcd every cycleInterval or not in alert mode
  if (forced || ((cycleTimer >= cycleInterval && !isScreenOff) && !isAlert))
  {
    lcdCycleCount = (lcdCycleCount + 1) % 4;
    cycleTimer = 0;
    lcd.clear();

    switch (lcdCycleCount)
    {
    case 0:
      if (WiFi.status() != WL_CONNECTED)
      {
        lcd.setCursor(0, 0);
        lcd.print("WIFI MISSING");
        lcd.setCursor(0, 1);
        lcd.print("TRY CONNECTING...");
      }
      else
      {
        lcd.setCursor(0, 0);
        lcd.print("AIR QUALITY");
        lcd.setCursor(0, 1);
        lcd.print("SEEMS GOOD HERE");
      }

      break;
    case 1:
      lcd.setCursor(0, 0);
      lcd.print("TEMP ");
      lcd.print(currentPayload.temp);
      lcd.print("C");

      lcd.setCursor(0, 1);
      lcd.print("HUMID ");
      lcd.print(currentPayload.humid);
      lcd.print(" %");
      break;

    case 2:
      lcd.setCursor(0, 0);
      lcd.print("SMOKE ");
      lcd.print(currentPayload.smoke);
      lcd.print(" PPM");

      lcd.setCursor(0, 1);
      lcd.print("CO2 ");
      lcd.print(currentPayload.co2);
      lcd.print(" PPM");
      break;

    case 3:
      lcd.setCursor(0, 0);
      lcd.print("LPG ");
      lcd.print(currentPayload.lpg);
      lcd.print(" PPM");

      lcd.setCursor(0, 1);
      lcd.print("CO ");
      lcd.print(currentPayload.co);
      lcd.print(" PPM");
      break;

    default:
      break;
    }
  }
  // special case 4
  if (isAlert)
  {
    // scroll every scrollInterval
    if (scrollTimer >= scrollInterval)
    {
      lcd.scrollDisplayLeft();
      scrollTimer = 0;
    }
  }
  scrollTimer += millis() - prevCycleTime;
  cycleTimer += millis() - prevCycleTime;
  prevCycleTime = millis();
}
void cycleLcd()
{
  cycleLcd(false);
}

void setup()
{
  Serial.begin(115200);

  pinMode(btnPin, INPUT);
  pinMode(buzzerPin, OUTPUT);

  // wifi config
  WiFi.mode(WIFI_AP_STA);
  WiFi.softAP(ssid, password);

  // connect to blynk and router wifi
  WiFi.begin(WIFI_ID, WIFI_PASS);
  Blynk.begin(auth, WIFI_ID, WIFI_PASS);
  // pending for wifi connection
  while (WiFi.status() != WL_CONNECTED)
  {
    delay(1000);
    Serial.println("Connecting to WiFi...");
  }
  Serial.println("WiFi connected");
  //
  // start webserver
  server.begin();
  Serial.println("Webserver has started");
  Serial.print("AP IP address: ");
  Serial.println(WiFi.softAPIP());
  Serial.println(WiFi.localIP());

  timer.setInterval(5000L, sendToBlynk); // sending to Blynk every 5 sec

  // initialize the lcd
  lcd.init(); // initialize the lcd
  lcd.backlight();
  lcd.setCursor(2, 0);
  lcd.print("LOOKING FOR");
  lcd.setCursor(0, 1);
  lcd.print("SENSOR NODE!");
  lcd.setCursor(0, 0);

  lastConnectionAttempt = millis();
  prevCycleTime = millis();
}

void loop()
{
  // handle lost connection
  if (WiFi.status() != WL_CONNECTED)
  {
    // check delay:
    if (millis() - lastConnectionAttempt >= connectionDelay)
    {
      lastConnectionAttempt = millis();
      WiFi.begin(ssid, password);
    }
  }
  else
  {

    WiFiClient client = server.available(); // get incoming clients
    if (client)
    {
      Serial.println("Client Found");
      while (client.connected() && client.available() == 0)
      {
        delay(10);
      }
      if (client.available())
      {
        String payload = client.readStringUntil('\n'); // Read data from the client
        Serial.println("Received: " + payload);
        extractPayload(payload);
        readyToSend = true; // can now send with new data
      }
      client.stop();
    }
    Blynk.run();
    timer.run();
  }

  cycleLcd();

  // timer for lcd screen sleep
  if (!isScreenOff)
  {

    screenoffTimer += millis() - screenTimePrev;
    screenTimePrev = millis();
    // do screen sleep
    if (screenoffTimer > lcdSleepInterval && !isAlert)
    {
      lcd.noDisplay();
      lcd.noBacklight();
      isScreenOff = true;
      Serial.println("Screen is off");
    }
    // skip sleep if alerting
    if (isAlert)
    {
      screenoffTimer = 0;
    }
  }

  // screen wakeup
  if (digitalRead(btnPin) == HIGH && isScreenOff)
  {
    lcd.backlight();
    lcd.display();
    screenoffTimer = 0;
    isScreenOff = false;
    Serial.println("Screen is on");
  }
}
